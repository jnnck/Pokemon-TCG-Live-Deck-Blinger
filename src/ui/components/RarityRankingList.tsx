import type { RarityTier } from "../../types";

interface Props {
  ranking: RarityTier[];
  onChange: (next: RarityTier[]) => void;
}

export default function RarityRankingList({ ranking, onChange }: Props) {
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= ranking.length) return;
    const next = [...ranking];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <ol className="space-y-2">
      {ranking.map((tier, i) => (
        <li key={tier.join("/")} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm">{i + 1}. {tier.join(" / ")}</span>
          <span className="flex gap-2">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="rounded bg-slate-100 px-2 py-1 text-sm disabled:opacity-40"
            >
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === ranking.length - 1}
              className="rounded bg-slate-100 px-2 py-1 text-sm disabled:opacity-40"
            >
              ↓
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}
