import { useMemo, useState } from "react";
import { useDeck } from "../../state/DeckContext";
import { formatDeck } from "../../export/formatDeck";
import { encodeDeckToHash } from "../../export/shareUrl";
import type { Deck } from "../../types";

interface Props { onBack: () => void; }

export default function ExportScreen({ onBack }: Props) {
  const { state, resolvedPrinting } = useDeck();
  const [copied, setCopied] = useState<"deck" | "link" | null>(null);

  const upgradedDeck = useMemo<Deck | null>(() => {
    if (!state.deck) return null;
    const entries = state.deck.entries.map((entry) => {
      const printing = resolvedPrinting(entry);
      if (!printing) return entry;
      return { ...entry, setCode: printing.setCode, number: printing.number };
    });
    return { entries, warnings: [] };
  }, [state.deck, resolvedPrinting]);

  if (!upgradedDeck) return null;
  const text = formatDeck(upgradedDeck);

  async function copy(value: string, which: "deck" | "link") {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-slate-500 underline">Back</button>
        <h1 className="text-xl font-bold">Export</h1>
        <span />
      </header>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 text-xs">{text}</pre>
      <div className="space-y-2">
        <button
          onClick={() => copy(text, "deck")}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white"
        >
          {copied === "deck" ? "Copied!" : "Copy decklist"}
        </button>
        <button
          onClick={() => copy(`${window.location.origin}${window.location.pathname}#${encodeDeckToHash(upgradedDeck)}`, "link")}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold"
        >
          {copied === "link" ? "Copied!" : "Copy share link"}
        </button>
      </div>
    </section>
  );
}
