import type { Preferences, Printing } from "../types";

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rarityIndex(rarity: string | null, ranking: string[]): number {
  if (rarity === null) return ranking.length;
  const idx = ranking.indexOf(rarity);
  return idx === -1 ? ranking.length : idx;
}

export function rankPrintings(printings: Printing[], prefs: Preferences): Printing[] {
  const dir = prefs.tiebreaker === "newest" ? -1 : 1;
  return [...printings].sort((a, b) => {
    const rd =
      rarityIndex(a.rarity, prefs.rarityRanking) - rarityIndex(b.rarity, prefs.rarityRanking);
    if (rd !== 0) return rd;
    return dir * a.releaseDate.localeCompare(b.releaseDate);
  });
}

export function pickUpgrade(
  cardName: string,
  printings: Printing[],
  prefs: Preferences,
): Printing | null {
  if (printings.length === 0) return null;
  const key = normalizeName(cardName);
  const lock = prefs.locks[key];
  if (lock) {
    const match = printings.find((p) => p.setCode === lock.setCode && p.number === lock.number);
    if (match) return match;
  }
  return rankPrintings(printings, prefs)[0];
}
