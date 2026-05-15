import type { Preferences, Printing, RarityTier } from "../types";

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const UNKNOWN_RARITY = Number.MAX_SAFE_INTEGER;

function rarityIndex(rarity: string | null, ranking: RarityTier[]): number {
  if (rarity === null) return UNKNOWN_RARITY;
  const idx = ranking.findIndex((tier) => tier.includes(rarity));
  return idx === -1 ? UNKNOWN_RARITY : idx;
}

export function rankPrintings(printings: Printing[], prefs: Preferences): Printing[] {
  const tieDir = prefs.tiebreaker === "newest" ? -1 : 1;
  const rarityDir = prefs.mode === "simplify" ? -1 : 1;
  return [...printings].sort((a, b) => {
    const ai = rarityIndex(a.rarity, prefs.rarityRanking);
    const bi = rarityIndex(b.rarity, prefs.rarityRanking);
    if (ai === UNKNOWN_RARITY && bi !== UNKNOWN_RARITY) return 1;
    if (bi === UNKNOWN_RARITY && ai !== UNKNOWN_RARITY) return -1;
    const rd = (ai - bi) * rarityDir;
    if (rd !== 0) return rd;
    return tieDir * a.releaseDate.localeCompare(b.releaseDate);
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
