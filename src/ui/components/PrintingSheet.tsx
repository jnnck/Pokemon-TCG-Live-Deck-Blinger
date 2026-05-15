import { useEffect } from "react";
import type { Printing } from "../../types";

interface Props {
  cardName: string;
  printings: Printing[];
  selectedId: string | null;
  onSelect: (printing: Printing) => void;
  onUseDefault: () => void;
  onClose: () => void;
}

export default function PrintingSheet({ cardName, printings, selectedId, onSelect, onUseDefault, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-w-xl sm:rounded-2xl md:max-w-3xl lg:max-w-5xl"
      >
        <header className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold">{cardName}</h2>
          <button onClick={onClose} className="text-slate-500">Close</button>
        </header>
        <button
          onClick={onUseDefault}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          Use default ranking
        </button>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {printings.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`rounded-lg border-2 p-2 text-left ${
                selectedId === p.id ? "border-emerald-500" : "border-transparent"
              }`}
            >
              <img src={p.imageSmall} alt="" className="w-full rounded" />
              <div className="mt-1 text-xs font-medium">{p.setName}</div>
              <div className="text-xs text-slate-500">{p.setCode} {p.number}</div>
              <div className="text-xs text-slate-500">{p.rarity ?? "—"}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
