import type { Printing } from "../types";

const MEE_RELEASE = "2025/09/26";
const MEE_IMAGE = (n: number): { small: string; large: string } => ({
  small: `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/MEE/MEE_${String(n).padStart(3, "0")}_R_EN.png`,
  large: `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/MEE/MEE_${String(n).padStart(3, "0")}_R_EN_LG.png`,
});

function mee(name: string, n: number): Printing {
  const img = MEE_IMAGE(n);
  return {
    id: `mee-${n}`,
    name,
    setCode: "MEE",
    setName: "Mega Evolution Energies",
    number: String(n),
    rarity: "Common",
    standardLegal: true,
    imageSmall: img.small,
    imageLarge: img.large,
    releaseDate: MEE_RELEASE,
    hp: null,
    subtypes: ["Basic"],
    attacks: [],
    abilities: [],
  };
}

export const FALLBACK_PRINTINGS: Printing[] = [
  mee("Grass Energy", 1),
  mee("Fire Energy", 2),
  mee("Water Energy", 3),
  mee("Lightning Energy", 4),
  mee("Psychic Energy", 5),
  mee("Fighting Energy", 6),
  mee("Darkness Energy", 7),
  mee("Metal Energy", 8),
];
