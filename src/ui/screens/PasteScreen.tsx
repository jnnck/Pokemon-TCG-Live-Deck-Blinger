import { useState } from "react";
import { parseDeck } from "../../parser/parseDeck";
import { useDeck } from "../../state/DeckContext";
import type { Mode } from "../../types";

interface Props {
  onDone: () => void;
  onSettings: () => void;
}

const PLACEHOLDER = `Pokémon: 21
4 Dreepy TWM 128
4 Drakloak TWM 129
...

Trainer: 32
4 Boss's Orders MEG 114
...

Energy: 7
2 Fire Energy MEE 2
...`;

const MODES: Array<{ value: Mode; label: string; hint: string }> = [
  { value: "bling", label: "Bling", hint: "Rarest available print" },
  { value: "simplify", label: "Simplify", hint: "Plainest available print" },
];

export default function PasteScreen({ onDone, onSettings }: Props) {
  const { setDeck, prefs, updatePrefs } = useDeck();
  const [text, setText] = useState("");

  function handleSubmit() {
    const deck = parseDeck(text);
    if (deck.entries.length === 0) return;
    setDeck(deck);
    onDone();
  }

  const activeMode = MODES.find((m) => m.value === prefs.mode) ?? MODES[0];

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Paste a decklist</h1>
        <button onClick={onSettings} className="text-sm text-slate-500 underline">
          Settings
        </button>
      </header>

      <div className="space-y-1">
        <div className="flex gap-2 rounded-lg bg-slate-200 p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => updatePrefs({ ...prefs, mode: m.value })}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                prefs.mode === m.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 px-1">{activeMode.hint} — newest set within that tier.</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={16}
        className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm"
      />
      <button
        onClick={handleSubmit}
        disabled={text.trim() === ""}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-white font-semibold disabled:bg-slate-300"
      >
        {prefs.mode === "simplify" ? "Simplify Deck" : "Bling Deck"}
      </button>
    </section>
  );
}
