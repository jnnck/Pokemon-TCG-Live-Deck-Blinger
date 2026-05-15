import type { Printing } from "../types";

interface ApiCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
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
  return body.data.map(toPrinting).filter((p): p is Printing => p !== null);
}
