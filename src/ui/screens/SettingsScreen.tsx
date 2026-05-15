import { useDeck } from "../../state/DeckContext";
import RarityRankingList from "../components/RarityRankingList";

interface Props { onBack: () => void; }

export default function SettingsScreen({ onBack }: Props) {
  const { prefs, updatePrefs } = useDeck();

  const lockEntries = Object.entries(prefs.locks);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-slate-500 underline">Back</button>
        <h1 className="text-xl font-bold">Settings</h1>
        <span />
      </header>

      <section className="space-y-2">
        <h2 className="font-semibold">Rarity ranking</h2>
        <p className="text-xs text-slate-500">Higher = preferred when auto-selecting the upgrade.</p>
        <RarityRankingList
          ranking={prefs.rarityRanking}
          onChange={(rarityRanking) => updatePrefs({ ...prefs, rarityRanking })}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Tiebreaker</h2>
        <div className="flex gap-2">
          {(["newest", "oldest"] as const).map((option) => (
            <button
              key={option}
              onClick={() => updatePrefs({ ...prefs, tiebreaker: option })}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                prefs.tiebreaker === option ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
              }`}
            >
              {option === "newest" ? "Newest first" : "Oldest first"}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Locked card choices</h2>
        {lockEntries.length === 0 && <p className="text-sm text-slate-500">No locks yet.</p>}
        <ul className="space-y-1">
          {lockEntries.map(([key, choice]) => (
            <li key={key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span>{key} → {choice.setCode} {choice.number}</span>
              <button
                onClick={() => {
                  const locks = { ...prefs.locks };
                  delete locks[key];
                  updatePrefs({ ...prefs, locks });
                }}
                className="text-red-600"
              >
                Clear
              </button>
            </li>
          ))}
        </ul>
        {lockEntries.length > 0 && (
          <button
            onClick={() => updatePrefs({ ...prefs, locks: {} })}
            className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700"
          >
            Clear all locks
          </button>
        )}
      </section>
    </section>
  );
}
