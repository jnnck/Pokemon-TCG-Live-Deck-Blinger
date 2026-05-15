import { useEffect, useState } from "react";
import { DeckProvider, useDeck } from "./state/DeckContext";
import PasteScreen from "./ui/screens/PasteScreen";
import ReviewScreen from "./ui/screens/ReviewScreen";
import ExportScreen from "./ui/screens/ExportScreen";
import SettingsScreen from "./ui/screens/SettingsScreen";
import { decodeDeckFromHash } from "./export/shareUrl";

export type Screen = "paste" | "review" | "export" | "settings";

export default function App() {
  return (
    <DeckProvider>
      <AppShell />
    </DeckProvider>
  );
}

function AppShell() {
  const [screen, setScreen] = useState<Screen>("paste");
  const { setDeck } = useDeck();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const decoded = decodeDeckFromHash(hash);
    if (decoded) {
      setDeck(decoded);
      setScreen("review");
    }
  }, [setDeck]);

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-6">
      {screen === "paste" && <PasteScreen onDone={() => setScreen("review")} onSettings={() => setScreen("settings")} />}
      {screen === "review" && <ReviewScreen onBack={() => setScreen("paste")} onExport={() => setScreen("export")} />}
      {screen === "export" && <ExportScreen onBack={() => setScreen("review")} />}
      {screen === "settings" && <SettingsScreen onBack={() => setScreen("paste")} />}
    </main>
  );
}
