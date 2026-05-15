import { describe, expect, it } from "vitest";
import { fingerprint, filterByFingerprint } from "./fingerprint";
import type { Printing } from "../types";

function p(partial: Partial<Printing>): Printing {
  return {
    id: `${partial.setCode}-${partial.number}`,
    name: "Dreepy",
    setCode: "XXX",
    setName: "X",
    number: "1",
    rarity: "Common",
    standardLegal: true,
    imageSmall: "",
    imageLarge: "",
    releaseDate: "2024/01/01",
    hp: "60",
    subtypes: ["Basic"],
    attacks: [{ name: "Quick Attack", cost: ["Psychic"], damage: "10+", text: "Flip a coin. If heads, this attack does 10 more damage." }],
    abilities: [],
    ...partial,
  };
}

describe("fingerprint", () => {
  it("produces the same key for two prints of the same Pokémon card", () => {
    const a = p({ setCode: "RCL", number: "89" });
    const b = p({ setCode: "SHF", number: "SV060" });
    expect(fingerprint(a)).toBe(fingerprint(b));
  });

  it("differentiates Pokémon with the same name but different attacks", () => {
    const a = p({ setCode: "RCL", attacks: [{ name: "Quick Attack", cost: ["Psychic"], damage: "10", text: "" }] });
    const b = p({ setCode: "FST", attacks: [{ name: "Infestation", cost: ["Psychic"], damage: "10", text: "" }] });
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it("differentiates same-attack Pokémon when HP differs", () => {
    const a = p({ hp: "60" });
    const b = p({ hp: "70" });
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it("treats Trainers (no hp/attacks/abilities) as identical when name matches", () => {
    const a = p({ name: "Boss's Orders", hp: null, subtypes: ["Supporter"], attacks: [], abilities: [] });
    const b = p({ name: "Boss's Orders", hp: null, subtypes: ["Supporter"], attacks: [], abilities: [] });
    expect(fingerprint(a)).toBe(fingerprint(b));
  });
});

describe("filterByFingerprint", () => {
  it("returns all printings unchanged when reference is null", () => {
    const list = [p({ setCode: "A" }), p({ setCode: "B" })];
    expect(filterByFingerprint(null, list)).toEqual(list);
  });

  it("returns all printings unchanged for a Trainer-like reference (no attacks/abilities/hp)", () => {
    const trainer = p({ name: "Boss's Orders", hp: null, attacks: [], abilities: [] });
    const list = [trainer, p({ name: "Boss's Orders", setCode: "Z", hp: null, attacks: [], abilities: [] })];
    expect(filterByFingerprint(trainer, list)).toHaveLength(2);
  });

  it("keeps only prints with matching attacks for a Pokémon reference", () => {
    const ref = p({ setCode: "RCL", attacks: [{ name: "Quick Attack", cost: ["Psychic"], damage: "10+", text: "Flip a coin." }] });
    const same = p({ setCode: "SHF", attacks: [{ name: "Quick Attack", cost: ["Psychic"], damage: "10+", text: "Flip a coin." }] });
    const different = p({ setCode: "FST", attacks: [{ name: "Infestation", cost: ["Psychic"], damage: "10", text: "" }] });
    const filtered = filterByFingerprint(ref, [ref, same, different]);
    expect(filtered.map((x) => x.setCode).sort()).toEqual(["RCL", "SHF"]);
  });
});
