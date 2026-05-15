import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { fetchPrintingsByName } from "../api/pokemonTcgApi";
import { createPrintingCache } from "../cache/printingCache";
import { loadPreferences, savePreferences } from "../prefs/preferences";
import { normalizeName, pickUpgrade } from "../upgrade/rankPrintings";
import type { Deck, DeckEntry, Preferences, Printing } from "../types";

type PrintingsByName = Record<string, Printing[]>;

interface State {
  deck: Deck | null;
  printings: PrintingsByName;
  selected: Record<string, { setCode: string; number: string }>;
  loadingNames: string[];
  errors: Record<string, string>;
  staleNames: string[];
}

type Action =
  | { type: "deck/set"; deck: Deck }
  | { type: "printings/loaded"; name: string; printings: Printing[]; stale: boolean }
  | { type: "printings/error"; name: string; message: string }
  | { type: "selection/set"; name: string; choice: { setCode: string; number: string } }
  | { type: "selection/clear"; name: string };

const initialState: State = {
  deck: null,
  printings: {},
  selected: {},
  loadingNames: [],
  errors: {},
  staleNames: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "deck/set":
      return { ...initialState, deck: action.deck };
    case "printings/loaded":
      return {
        ...state,
        printings: { ...state.printings, [normalizeName(action.name)]: action.printings },
        staleNames: action.stale ? [...state.staleNames, normalizeName(action.name)] : state.staleNames,
      };
    case "printings/error":
      return { ...state, errors: { ...state.errors, [normalizeName(action.name)]: action.message } };
    case "selection/set":
      return { ...state, selected: { ...state.selected, [normalizeName(action.name)]: action.choice } };
    case "selection/clear": {
      const next = { ...state.selected };
      delete next[normalizeName(action.name)];
      return { ...state, selected: next };
    }
    default:
      return state;
  }
}

interface ContextValue {
  state: State;
  prefs: Preferences;
  setDeck: (deck: Deck) => void;
  selectPrinting: (cardName: string, printing: Printing) => void;
  clearSelection: (cardName: string) => void;
  updatePrefs: (next: Preferences) => void;
  resolvedPrinting: (entry: DeckEntry) => Printing | null;
}

const DeckContext = createContext<ContextValue | null>(null);
const cache = createPrintingCache();

export function DeckProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());

  useEffect(() => {
    if (!state.deck) return;
    const controller = new AbortController();
    const seen = new Set<string>();
    for (const entry of state.deck.entries) {
      const key = normalizeName(entry.name);
      if (seen.has(key)) continue;
      seen.add(key);
      void (async () => {
        try {
          const cached = await cache.get(entry.name);
          if (cached) {
            dispatch({ type: "printings/loaded", name: entry.name, printings: cached.printings, stale: cached.stale });
            if (!cached.stale) return;
          }
          const fresh = await fetchPrintingsByName(entry.name, controller.signal);
          await cache.set(entry.name, fresh);
          dispatch({ type: "printings/loaded", name: entry.name, printings: fresh, stale: false });
        } catch (err) {
          if ((err as DOMException)?.name === "AbortError") return;
          dispatch({ type: "printings/error", name: entry.name, message: (err as Error).message });
        }
      })();
    }
    return () => controller.abort();
  }, [state.deck]);

  const setDeck = useCallback((deck: Deck) => dispatch({ type: "deck/set", deck }), []);

  const selectPrinting = useCallback((cardName: string, printing: Printing) => {
    dispatch({ type: "selection/set", name: cardName, choice: { setCode: printing.setCode, number: printing.number } });
    setPrefs((p) => {
      const next: Preferences = { ...p, locks: { ...p.locks, [normalizeName(cardName)]: { setCode: printing.setCode, number: printing.number } } };
      savePreferences(next);
      return next;
    });
  }, []);

  const clearSelection = useCallback((cardName: string) => {
    dispatch({ type: "selection/clear", name: cardName });
    setPrefs((p) => {
      const locks = { ...p.locks };
      delete locks[normalizeName(cardName)];
      const next: Preferences = { ...p, locks };
      savePreferences(next);
      return next;
    });
  }, []);

  const updatePrefs = useCallback((next: Preferences) => {
    setPrefs(next);
    savePreferences(next);
  }, []);

  const resolvedPrinting = useCallback(
    (entry: DeckEntry): Printing | null => {
      const key = normalizeName(entry.name);
      const explicit = state.selected[key];
      const printings = state.printings[key] ?? [];
      if (explicit) {
        return printings.find((p) => p.setCode === explicit.setCode && p.number === explicit.number) ?? null;
      }
      return pickUpgrade(entry.name, printings, prefs);
    },
    [state.printings, state.selected, prefs],
  );

  const value = useMemo<ContextValue>(
    () => ({ state, prefs, setDeck, selectPrinting, clearSelection, updatePrefs, resolvedPrinting }),
    [state, prefs, setDeck, selectPrinting, clearSelection, updatePrefs, resolvedPrinting],
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside DeckProvider");
  return ctx;
}
