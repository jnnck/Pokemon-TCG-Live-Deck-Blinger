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

export interface Attack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

export interface Ability {
  name: string;
  text: string;
  type: string;
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
  hp: string | null;
  subtypes: string[];
  attacks: Attack[];
  abilities: Ability[];
}

export type LockMap = Record<string, { setCode: string; number: string }>;

export type RarityTier = string[];
export type Mode = "bling" | "simplify";

export interface Preferences {
  rarityRanking: RarityTier[];
  tiebreaker: "newest" | "oldest";
  mode: Mode;
  locks: LockMap;
}

export const DEFAULT_RARITY_RANKING: RarityTier[] = [
  ["Special Illustration Rare"],
  ["Hyper Rare", "Rare Secret"],
  ["Ultra Rare", "Rare Ultra"],
  ["Illustration Rare"],
  ["Rare Holo"],
  ["Rare"],
  ["Uncommon"],
  ["Common"],
];

export const DEFAULT_PREFERENCES: Preferences = {
  rarityRanking: DEFAULT_RARITY_RANKING,
  tiebreaker: "newest",
  mode: "bling",
  locks: {},
};
