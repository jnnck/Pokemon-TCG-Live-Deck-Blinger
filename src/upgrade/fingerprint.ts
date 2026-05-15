import type { Printing } from "../types";

export function fingerprint(printing: Printing): string {
  const attacks = printing.attacks
    .map((a) => `${a.name}|${[...a.cost].sort().join(",")}|${a.damage}|${a.text}`)
    .sort()
    .join("§");
  const abilities = printing.abilities
    .map((a) => `${a.name}|${a.text}`)
    .sort()
    .join("§");
  const subtypes = [...printing.subtypes].sort().join(",");
  return [printing.name.toLowerCase(), printing.hp ?? "", subtypes, attacks, abilities].join("¦");
}

export function filterByFingerprint(
  reference: Printing | null,
  printings: Printing[],
): Printing[] {
  if (!reference) return printings;
  if (reference.attacks.length === 0 && reference.abilities.length === 0 && reference.hp === null) {
    return printings;
  }
  const target = fingerprint(reference);
  return printings.filter((p) => fingerprint(p) === target);
}
