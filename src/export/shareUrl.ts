import type { Deck } from "../types";

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeDeckToHash(deck: Deck): string {
  const payload = { v: 1, entries: deck.entries };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeDeckFromHash(hash: string): Deck | null {
  if (!hash) return null;
  try {
    const json = fromBase64Url(hash);
    const parsed = JSON.parse(json);
    if (parsed?.v !== 1 || !Array.isArray(parsed.entries)) return null;
    return { entries: parsed.entries, warnings: [] };
  } catch {
    return null;
  }
}
