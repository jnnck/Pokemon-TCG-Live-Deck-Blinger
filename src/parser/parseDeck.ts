import type { Deck, DeckEntry, Section } from "../types";

const SECTION_HEADER = /^(Pokémon|Pokemon|Trainer|Energy)\s*:/i;
const CARD_LINE = /^(\d+)\s+(.+?)\s+([A-Z]{2,5})\s+(\w+)$/;

function normalizeSection(raw: string): Section {
  const lower = raw.toLowerCase();
  if (lower.startsWith("pok")) return "Pokémon";
  if (lower.startsWith("trainer")) return "Trainer";
  return "Energy";
}

export function parseDeck(text: string): Deck {
  const entries: DeckEntry[] = [];
  const warnings: string[] = [];
  let section: Section | null = null;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    const header = line.match(SECTION_HEADER);
    if (header) {
      section = normalizeSection(header[1]);
      continue;
    }

    const card = line.match(CARD_LINE);
    if (!card) {
      warnings.push(`Could not parse line ${i + 1}: "${line}"`);
      continue;
    }

    if (section === null) {
      warnings.push(`Line ${i + 1} appears before any section header: "${line}"`);
      continue;
    }

    entries.push({
      count: Number(card[1]),
      name: card[2],
      setCode: card[3],
      number: card[4],
      section,
    });
  }

  return { entries, warnings };
}
