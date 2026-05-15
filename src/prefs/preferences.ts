import { DEFAULT_PREFERENCES, type Preferences } from "../types";

const KEY = "tcgl-blinger:prefs";

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      rarityRanking: Array.isArray(parsed.rarityRanking) ? parsed.rarityRanking : DEFAULT_PREFERENCES.rarityRanking,
      tiebreaker: parsed.tiebreaker === "oldest" ? "oldest" : "newest",
      locks: parsed.locks && typeof parsed.locks === "object" ? parsed.locks : {},
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
