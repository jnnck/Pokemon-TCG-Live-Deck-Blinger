import { normalizeName } from "../upgrade/rankPrintings";
import { FALLBACK_PRINTINGS } from "./fallbackPrintings";
import type { Printing } from "../types";

interface ApiAttack {
  name: string;
  cost?: string[];
  damage?: string;
  text?: string;
}

interface ApiAbility {
  name: string;
  text?: string;
  type?: string;
}

interface ApiCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  hp?: string;
  subtypes?: string[];
  attacks?: ApiAttack[];
  abilities?: ApiAbility[];
  set: {
    name: string;
    ptcgoCode?: string;
    releaseDate: string;
  };
  legalities?: { standard?: string };
  images?: { small?: string; large?: string };
}

interface ApiResponse {
  data: ApiCard[];
}

const BASE = "https://api.pokemontcg.io/v2";

function escapeQuery(name: string): string {
  return name.replace(/"/g, '\\"');
}

function toPrinting(card: ApiCard): Printing | null {
  const setCode = card.set.ptcgoCode;
  if (!setCode) return null;
  return {
    id: card.id,
    name: card.name,
    setCode,
    setName: card.set.name,
    number: card.number,
    rarity: card.rarity ?? null,
    standardLegal: card.legalities?.standard === "Legal",
    imageSmall: card.images?.small ?? "",
    imageLarge: card.images?.large ?? card.images?.small ?? "",
    releaseDate: card.set.releaseDate,
    hp: card.hp ?? null,
    subtypes: card.subtypes ?? [],
    attacks: (card.attacks ?? []).map((a) => ({
      name: a.name,
      cost: a.cost ?? [],
      damage: a.damage ?? "",
      text: a.text ?? "",
    })),
    abilities: (card.abilities ?? []).map((a) => ({
      name: a.name,
      text: a.text ?? "",
      type: a.type ?? "",
    })),
  };
}

export async function fetchPrintingsByName(
  name: string,
  signal?: AbortSignal,
): Promise<Printing[]> {
  const q = `name:"${escapeQuery(name)}"`;
  const url = `${BASE}/cards?q=${encodeURIComponent(q)}&pageSize=250`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`pokemontcg.io ${res.status}`);
  const body = (await res.json()) as ApiResponse;
  const target = normalizeName(name);
  const fromApi = body.data
    .map(toPrinting)
    .filter((p): p is Printing => p !== null && normalizeName(p.name) === target);

  const fromFallback = FALLBACK_PRINTINGS.filter((p) => normalizeName(p.name) === target);
  const seen = new Set(fromApi.map((p) => `${p.setCode}-${p.number}`));
  const merged = [...fromApi];
  for (const p of fromFallback) {
    if (!seen.has(`${p.setCode}-${p.number}`)) merged.push(p);
  }
  return merged;
}
