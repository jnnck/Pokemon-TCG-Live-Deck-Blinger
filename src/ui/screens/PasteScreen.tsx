import { useState } from "react";
import { parseDeck } from "../../parser/parseDeck";
import { useDeck } from "../../state/DeckContext";

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

export default function PasteScreen({ onDone, onSettings }: Props) {
  const { setDeck } = useDeck();
  const [text, setText] = useState("");

  function handleSubmit() {
    const deck = parseDeck(text);
    if (deck.entries.length === 0) return;
    setDeck(deck);
    onDone();
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Paste a decklist</h1>
        <button onClick={onSettings} className="text-sm text-slate-500 underline">
          Settings
        </button>
      </header>
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
        Upgrade Deck
      </button>
    </section>
  );
}
