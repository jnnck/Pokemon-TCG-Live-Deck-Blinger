import type { Deck, Section } from "../types";

const ORDER: Section[] = ["Pokémon", "Trainer", "Energy"];

export function formatDeck(deck: Deck): string {
  const chunks: string[] = [];
  for (const section of ORDER) {
    const entries = deck.entries.filter((e) => e.section === section);
    if (entries.length === 0) continue;
    const total = entries.reduce((sum, e) => sum + e.count, 0);
    chunks.push(`${section}: ${total}`);
    for (const e of entries) {
      chunks.push(`${e.count} ${e.name} ${e.setCode} ${e.number}`);
    }
    chunks.push("");
  }
  if (chunks[chunks.length - 1] === "") chunks.pop();
  return chunks.join("\n");
}
