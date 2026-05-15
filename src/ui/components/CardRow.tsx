import type { DeckEntry, Printing } from "../../types";

interface Props {
  entry: DeckEntry;
  upgraded: Printing | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  onClick: () => void;
}

export default function CardRow({ entry, upgraded, loading, notFound, error, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left active:bg-slate-100"
    >
      {upgraded?.imageSmall ? (
        <img src={upgraded.imageSmall} alt="" className="h-16 w-12 rounded" />
      ) : (
        <div className="h-16 w-12 rounded bg-slate-200" />
      )}
      <div className="flex-1">
        <div className="font-semibold">{entry.count}× {entry.name}</div>
        <div className="text-xs text-slate-500">From {entry.setCode} {entry.number}</div>
        {loading && <div className="text-xs text-slate-400">Looking up printings…</div>}
        {notFound && <div className="text-xs text-amber-700">Not found — keeping original printing</div>}
        {error && <div className="text-xs text-red-600">{error}</div>}
        {upgraded && !loading && (
          <div className="text-xs text-emerald-700">
            → {upgraded.setCode} {upgraded.number} {upgraded.rarity ? `(${upgraded.rarity})` : ""}
          </div>
        )}
      </div>
      <span className="text-slate-400">›</span>
    </button>
  );
}
