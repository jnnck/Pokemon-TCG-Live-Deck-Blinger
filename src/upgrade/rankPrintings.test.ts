import { describe, expect, it } from "vitest";
import { rankPrintings, pickUpgrade } from "./rankPrintings";
import { DEFAULT_RARITY_RANKING } from "../types";
import type { Printing, Preferences } from "../types";

function p(partial: Partial<Printing>): Printing {
  return {
    id: `${partial.setCode}-${partial.number}`,
    name: "Boss's Orders",
    setCode: "XXX",
    setName: "X",
    number: "1",
    rarity: "Rare",
    standardLegal: true,
    imageSmall: "",
    imageLarge: "",
    releaseDate: "2024/01/01",
    hp: null,
    subtypes: [],
    attacks: [],
    abilities: [],
    ...partial,
  };
}

const prefs: Preferences = {
  rarityRanking: DEFAULT_RARITY_RANKING,
  tiebreaker: "newest",
  mode: "bling",
  locks: {},
};

describe("rankPrintings", () => {
  it("orders by configured rarity ranking", () => {
    const printings = [
      p({ rarity: "Rare Holo", setCode: "A" }),
      p({ rarity: "Special Illustration Rare", setCode: "B" }),
      p({ rarity: "Uncommon", setCode: "C" }),
    ];
    const ranked = rankPrintings(printings, prefs);
    expect(ranked.map((x) => x.setCode)).toEqual(["B", "A", "C"]);
  });

  it("uses newest-first as the default tiebreaker within a rarity", () => {
    const printings = [
      p({ rarity: "Rare Holo", setCode: "OLD", releaseDate: "2020/01/01" }),
      p({ rarity: "Rare Holo", setCode: "NEW", releaseDate: "2025/01/01" }),
    ];
    expect(rankPrintings(printings, prefs).map((x) => x.setCode)).toEqual(["NEW", "OLD"]);
  });

  it("respects oldest-first tiebreaker when configured", () => {
    const printings = [
      p({ rarity: "Rare Holo", setCode: "OLD", releaseDate: "2020/01/01" }),
      p({ rarity: "Rare Holo", setCode: "NEW", releaseDate: "2025/01/01" }),
    ];
    const oldestFirst: Preferences = { ...prefs, tiebreaker: "oldest" };
    expect(rankPrintings(printings, oldestFirst).map((x) => x.setCode)).toEqual(["OLD", "NEW"]);
  });

  it("sorts unknown rarities to the bottom", () => {
    const printings = [
      p({ rarity: "Cosmic Foil", setCode: "WEIRD" }),
      p({ rarity: "Rare Holo", setCode: "OK" }),
    ];
    expect(rankPrintings(printings, prefs).map((x) => x.setCode)).toEqual(["OK", "WEIRD"]);
  });

  it("treats aliased rarities within a tier as equivalent (newest wins)", () => {
    const printings = [
      p({ rarity: "Rare Secret", setCode: "OLD", releaseDate: "2020/01/01" }),
      p({ rarity: "Hyper Rare", setCode: "NEW", releaseDate: "2024/01/01" }),
    ];
    const ranked = rankPrintings(printings, prefs);
    expect(ranked.map((x) => x.setCode)).toEqual(["NEW", "OLD"]);
  });

  it("ranks Special Illustration Rare above Hyper Rare / Rare Secret by default", () => {
    const printings = [
      p({ rarity: "Special Illustration Rare", setCode: "SIR" }),
      p({ rarity: "Rare Secret", setCode: "GOLD" }),
    ];
    expect(rankPrintings(printings, prefs)[0].setCode).toBe("SIR");
  });

  it("in simplify mode, picks the plainest rarity but still the newest set", () => {
    const printings = [
      p({ rarity: "Special Illustration Rare", setCode: "SIR", releaseDate: "2025/01/01" }),
      p({ rarity: "Common", setCode: "OLD_COMMON", releaseDate: "2020/01/01" }),
      p({ rarity: "Common", setCode: "NEW_COMMON", releaseDate: "2024/01/01" }),
      p({ rarity: "Rare Holo", setCode: "HOLO", releaseDate: "2023/01/01" }),
    ];
    const simplify: Preferences = { ...prefs, mode: "simplify" };
    const ranked = rankPrintings(printings, simplify);
    expect(ranked[0].setCode).toBe("NEW_COMMON");
    expect(ranked.map((x) => x.setCode)).toEqual(["NEW_COMMON", "OLD_COMMON", "HOLO", "SIR"]);
  });

  it("keeps unknown rarities at the bottom in simplify mode (not promoted to top)", () => {
    const printings = [
      p({ rarity: "Cosmic Foil", setCode: "WEIRD" }),
      p({ rarity: "Common", setCode: "OK" }),
      p({ rarity: "Rare Holo", setCode: "HOLO" }),
    ];
    const simplify: Preferences = { ...prefs, mode: "simplify" };
    const ranked = rankPrintings(printings, simplify);
    expect(ranked[0].setCode).toBe("OK");
    expect(ranked[ranked.length - 1].setCode).toBe("WEIRD");
  });
});

describe("pickUpgrade", () => {
  it("returns the locked printing when a lock exists", () => {
    const printings = [
      p({ rarity: "Special Illustration Rare", setCode: "BEST", number: "100" }),
      p({ rarity: "Uncommon", setCode: "LOCK", number: "9" }),
    ];
    const locked: Preferences = {
      ...prefs,
      locks: { "boss's orders": { setCode: "LOCK", number: "9" } },
    };
    expect(pickUpgrade("Boss's Orders", printings, locked)?.setCode).toBe("LOCK");
  });

  it("falls back to the top ranked printing when no lock matches", () => {
    const printings = [
      p({ rarity: "Special Illustration Rare", setCode: "BEST" }),
      p({ rarity: "Uncommon", setCode: "C" }),
    ];
    expect(pickUpgrade("Boss's Orders", printings, prefs)?.setCode).toBe("BEST");
  });

  it("returns null when no printings are provided", () => {
    expect(pickUpgrade("Nothing", [], prefs)).toBeNull();
  });
});
