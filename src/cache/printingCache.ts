import { del, get, set } from "idb-keyval";
import { normalizeName } from "../upgrade/rankPrintings";
import type { Printing } from "../types";

export interface KVStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
}

interface Entry {
  fetchedAt: number;
  printings: Printing[];
}

export interface CacheOptions {
  ttlMs: number;
  now?: () => number;
}

export interface CacheResult {
  printings: Printing[];
  stale: boolean;
}

const defaultStore: KVStore = { get, set, del };

export function createPrintingCache(store: KVStore = defaultStore, opts: CacheOptions = { ttlMs: 30 * 24 * 60 * 60 * 1000 }) {
  const now = opts.now ?? (() => Date.now());
  const ttlMs = opts.ttlMs;
  const cacheKey = (name: string) => `printings:v3:${normalizeName(name)}`;

  return {
    async get(name: string): Promise<CacheResult | null> {
      const raw = (await store.get(cacheKey(name))) as Entry | undefined;
      if (!raw) return null;
      return { printings: raw.printings, stale: now() - raw.fetchedAt > ttlMs };
    },
    async set(name: string, printings: Printing[]): Promise<void> {
      await store.set(cacheKey(name), { fetchedAt: now(), printings });
    },
    async clear(name: string): Promise<void> {
      await store.del(cacheKey(name));
    },
  };
}
