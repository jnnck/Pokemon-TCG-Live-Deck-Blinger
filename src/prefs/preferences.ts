import { DEFAULT_PREFERENCES, type Preferences, type RarityTier } from "../types";

const KEY = "pokemon-tcg-live-deck-blinger:prefs";
const LEGACY_KEY = "tcgl-blinger:prefs";

function migrateRanking(raw: unknown): RarityTier[] {
  if (!Array.isArray(raw)) return DEFAULT_PREFERENCES.rarityRanking;
  return raw
    .map((tier): RarityTier | null => {
      if (typeof tier === "string") return [tier];
      if (Array.isArray(tier) && tier.every((s) => typeof s === "string")) return tier as RarityTier;
      return null;
    })
    .filter((t): t is RarityTier => t !== null && t.length > 0);
}

function readStoredPrefs(): string | null {
  const current = localStorage.getItem(KEY);
  if (current !== null) return current;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy !== null) {
    localStorage.setItem(KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
    return legacy;
  }
  return null;
}

export function loadPreferences(): Preferences {
  try {
    const raw = readStoredPrefs();
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<Preferences> & { rarityRanking?: unknown };
    const ranking = migrateRanking(parsed.rarityRanking);
    return {
      rarityRanking: ranking.length > 0 ? ranking : DEFAULT_PREFERENCES.rarityRanking,
      tiebreaker: parsed.tiebreaker === "oldest" ? "oldest" : "newest",
      mode: parsed.mode === "simplify" ? "simplify" : "bling",
      locks: parsed.locks && typeof parsed.locks === "object" ? parsed.locks : {},
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
