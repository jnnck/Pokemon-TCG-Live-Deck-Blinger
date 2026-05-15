import { describe, expect, it } from "vitest";
import { formatDeck } from "./formatDeck";
import type { Deck } from "../types";

const deck: Deck = {
  warnings: [],
  entries: [
    { count: 4, name: "Dreepy", setCode: "TWM", number: "128", section: "Pokémon" },
    { count: 3, name: "Dragapult ex", setCode: "TWM", number: "130", section: "Pokémon" },
    { count: 4, name: "Boss's Orders", setCode: "MEG", number: "114", section: "Trainer" },
    { count: 2, name: "Fire Energy", setCode: "MEE", number: "2", section: "Energy" },
  ],
};

describe("formatDeck", () => {
  it("groups entries by section with correct header counts", () => {
    const out = formatDeck(deck);
    expect(out).toBe(
      [
        "Pokémon: 7",
        "4 Dreepy TWM 128",
        "3 Dragapult ex TWM 130",
        "",
        "Trainer: 4",
        "4 Boss's Orders MEG 114",
        "",
        "Energy: 2",
        "2 Fire Energy MEE 2",
      ].join("\n"),
    );
  });

  it("omits empty sections", () => {
    const noEnergy: Deck = { warnings: [], entries: deck.entries.filter((e) => e.section !== "Energy") };
    const out = formatDeck(noEnergy);
    expect(out).not.toContain("Energy:");
  });

  it("preserves entry order within a section", () => {
    const out = formatDeck(deck);
    const lines = out.split("\n");
    expect(lines[1]).toBe("4 Dreepy TWM 128");
    expect(lines[2]).toBe("3 Dragapult ex TWM 130");
  });
});
