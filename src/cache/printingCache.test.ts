import { beforeEach, describe, expect, it } from "vitest";
import { createPrintingCache, type KVStore } from "./printingCache";
import type { Printing } from "../types";

function makeStorage(): KVStore {
  const map = new Map<string, unknown>();
  return {
    async get(k) { return map.get(k); },
    async set(k, v) { map.set(k, v); },
    async del(k) { map.delete(k); },
  };
}

const sample: Printing[] = [
  {
    id: "x-1", name: "Test", setCode: "X", setName: "X", number: "1",
    rarity: "Rare", standardLegal: true, imageSmall: "", imageLarge: "", releaseDate: "2024/01/01",
    hp: null, subtypes: [], attacks: [], abilities: [],
  },
];

describe("printingCache", () => {
  let storage: ReturnType<typeof makeStorage>;
  beforeEach(() => { storage = makeStorage(); });

  it("returns null for missing entries", async () => {
    const cache = createPrintingCache(storage, { ttlMs: 1000, now: () => 0 });
    expect(await cache.get("Test")).toBeNull();
  });

  it("returns fresh entries within TTL", async () => {
    const cache = createPrintingCache(storage, { ttlMs: 1000, now: () => 0 });
    await cache.set("Test", sample);
    expect(await cache.get("Test")).toEqual({ printings: sample, stale: false });
  });

  it("returns stale entries past TTL", async () => {
    let t = 0;
    const cache = createPrintingCache(storage, { ttlMs: 1000, now: () => t });
    await cache.set("Test", sample);
    t = 5000;
    const result = await cache.get("Test");
    expect(result).toEqual({ printings: sample, stale: true });
  });

  it("normalizes the lookup key (case and accents)", async () => {
    const cache = createPrintingCache(storage, { ttlMs: 1000, now: () => 0 });
    await cache.set("Pokémon", sample);
    expect((await cache.get("pokemon"))?.printings).toEqual(sample);
  });
});
