export type Section = "Pokémon" | "Trainer" | "Energy";

export interface DeckEntry {
  count: number;
  name: string;
  setCode: string;
  number: string;
  section: Section;
}

export interface Deck {
  entries: DeckEntry[];
  warnings: string[];
}

export interface Printing {
  id: string;
  name: string;
  setCode: string;
  setName: string;
  number: string;
  rarity: string | null;
  standardLegal: boolean;
  imageSmall: string;
  imageLarge: string;
  releaseDate: string;
}

export type LockMap = Record<string, { setCode: string; number: string }>;

export interface Preferences {
  rarityRanking: string[];
  tiebreaker: "newest" | "oldest";
  locks: LockMap;
}

export const DEFAULT_RARITY_RANKING: string[] = [
  "Special Illustration Rare",
  "Illustration Rare",
  "Hyper Rare",
  "Rare Ultra",
  "Rare Holo",
  "Rare",
  "Uncommon",
  "Common",
];

export const DEFAULT_PREFERENCES: Preferences = {
  rarityRanking: DEFAULT_RARITY_RANKING,
  tiebreaker: "newest",
  locks: {},
};
