import { describe, expect, it } from "vitest";
import { encodeDeckToHash, decodeDeckFromHash } from "./shareUrl";
import type { Deck } from "../types";

const deck: Deck = {
  warnings: [],
  entries: [
    { count: 4, name: "Dreepy", setCode: "TWM", number: "128", section: "Pokémon" },
    { count: 4, name: "Boss's Orders", setCode: "MEG", number: "114", section: "Trainer" },
  ],
};

describe("shareUrl", () => {
  it("round-trips a deck through the hash", () => {
    const hash = encodeDeckToHash(deck);
    const decoded = decodeDeckFromHash(hash);
    expect(decoded?.entries).toEqual(deck.entries);
  });

  it("produces a URL-safe string (no '+' or '/')", () => {
    const hash = encodeDeckToHash(deck);
    expect(hash).not.toMatch(/[+/]/);
  });

  it("returns null for malformed hashes", () => {
    expect(decodeDeckFromHash("not-a-real-hash")).toBeNull();
    expect(decodeDeckFromHash("")).toBeNull();
  });
});
