# TCGL Deck Blinger

Mobile-first React app that upgrades the printings in a Pokémon TCG Live decklist to their rarest available versions, while keeping the deck importable back into TCG Live.

## Develop

```bash
npm install
npm run dev
```

Requires Node 20.19+ or 22.12+ (Vite 8 dependency).

## Test

```bash
npm test          # unit + integration
npm run test:e2e  # Playwright happy-path
```

## Build

```bash
npm run build
npm run preview
```

## How it works

1. Paste a decklist in standard TCG Live format.
2. The app fetches every printing of every card from [pokemontcg.io](https://pokemontcg.io) and ranks them by rarity (configurable in Settings).
3. Review and override per-card choices; locked choices persist in localStorage.
4. Copy the upgraded decklist back into TCG Live or share via URL.

Card data is cached in IndexedDB for 30 days. No backend, no accounts.
