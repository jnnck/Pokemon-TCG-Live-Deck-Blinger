import { useMemo, useState } from "react";
import CardRow from "../components/CardRow";
import PrintingSheet from "../components/PrintingSheet";
import { useDeck } from "../../state/DeckContext";
import { normalizeName } from "../../upgrade/rankPrintings";

interface Props {
  onBack: () => void;
  onExport: () => void;
}

export default function ReviewScreen({ onBack, onExport }: Props) {
  const { state, resolvedPrinting, selectPrinting, clearSelection } = useDeck();
  const [openCard, setOpenCard] = useState<string | null>(null);

  const uniqueEntries = useMemo(() => {
    if (!state.deck) return [];
    const seen = new Set<string>();
    return state.deck.entries.filter((e) => {
      const key = normalizeName(e.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [state.deck]);

  if (!state.deck) return null;
  const deck = state.deck;

  const total = deck.entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-slate-500 underline">Back</button>
        <h1 className="text-xl font-bold">Review</h1>
        <span className="text-sm text-slate-500">{total} cards</span>
      </header>

      {deck.warnings.length > 0 && (
        <ul className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {deck.warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      )}

      <ul className="space-y-2">
        {uniqueEntries.map((entry) => {
          const key = normalizeName(entry.name);
          const printings = state.printings[key] ?? [];
          return (
            <li key={key}>
              <CardRow
                entry={entry}
                upgraded={resolvedPrinting(entry)}
                loading={printings.length === 0 && !state.errors[key]}
                error={state.errors[key] ?? null}
                onClick={() => setOpenCard(entry.name)}
              />
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-3">
        <button onClick={onExport} className="mx-auto block w-full max-w-md rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">
          Export
        </button>
      </div>

      {openCard && (() => {
        const key = normalizeName(openCard);
        const printings = state.printings[key] ?? [];
        const entry = deck.entries.find((e) => normalizeName(e.name) === key)!;
        const selected = resolvedPrinting(entry);
        return (
          <PrintingSheet
            cardName={openCard}
            printings={printings}
            selectedId={selected?.id ?? null}
            onSelect={(p) => { selectPrinting(openCard, p); setOpenCard(null); }}
            onUseDefault={() => { clearSelection(openCard); setOpenCard(null); }}
            onClose={() => setOpenCard(null)}
          />
        );
      })()}
    </section>
  );
}
