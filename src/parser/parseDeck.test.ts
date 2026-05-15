import { describe, expect, it } from "vitest";
import { parseDeck } from "./parseDeck";

describe("parseDeck", () => {
  it("parses a single Pokémon line under a Pokémon header", () => {
    const deck = parseDeck("Pokémon: 4\n4 Dreepy TWM 128");
    expect(deck.entries).toEqual([
      { count: 4, name: "Dreepy", setCode: "TWM", number: "128", section: "Pokémon" },
    ]);
    expect(deck.warnings).toEqual([]);
  });

  it("parses Trainer and Energy sections", () => {
    const text = [
      "Trainer: 1",
      "4 Boss's Orders MEG 114",
      "",
      "Energy: 1",
      "2 Fire Energy MEE 2",
    ].join("\n");
    const deck = parseDeck(text);
    expect(deck.entries).toEqual([
      { count: 4, name: "Boss's Orders", setCode: "MEG", number: "114", section: "Trainer" },
      { count: 2, name: "Fire Energy", setCode: "MEE", number: "2", section: "Energy" },
    ]);
  });

  it("handles multi-word names with punctuation", () => {
    const deck = parseDeck("Pokémon: 1\n3 Dragapult ex TWM 130");
    expect(deck.entries[0]).toMatchObject({ name: "Dragapult ex", setCode: "TWM", number: "130" });
  });

  it("collects warnings for unparseable lines", () => {
    const deck = parseDeck("Pokémon: 1\nthis line is broken\n4 Dreepy TWM 128");
    expect(deck.warnings).toEqual(["Could not parse line 2: \"this line is broken\""]);
    expect(deck.entries).toHaveLength(1);
  });

  it("ignores blank lines and tolerates trailing whitespace", () => {
    const text = "Pokémon: 1\n\n  4 Dreepy TWM 128  \n";
    const deck = parseDeck(text);
    expect(deck.entries).toHaveLength(1);
    expect(deck.warnings).toEqual([]);
  });

  it("returns a warning if a card line appears before any section header", () => {
    const deck = parseDeck("4 Dreepy TWM 128");
    expect(deck.entries).toEqual([]);
    expect(deck.warnings[0]).toContain("before any section header");
  });

  it("accepts plain ASCII 'Pokemon:' as equivalent to 'Pokémon:'", () => {
    const deck = parseDeck("Pokemon: 1\n4 Dreepy TWM 128");
    expect(deck.entries[0].section).toBe("Pokémon");
  });
});
