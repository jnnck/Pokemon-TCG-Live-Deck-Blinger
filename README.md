# Pokémon TCG Live Deck Blinger

**Live demo: [pokemon-tcg-live-deck-blinger.vercel.app](https://pokemon-tcg-live-deck-blinger.vercel.app/)**

Mobile-first React app that swaps every card in a Pokémon TCG Live decklist for a different *legal* printing — either the rarest available (**Bling**, default) or the plainest (**Simplify**, for budget proxies and clean builds). The deck stays importable into TCG Live either way.

Paste your decklist, get back the same deck with every card swapped to your preferred printing. Per-card overrides, persistent preferences, share-link export. No sign-up, no backend, no ads.

## Screenshots

<p align="center">
  <img src="public/screenshots/1-paste.png" alt="Paste screen — empty textarea with the expected TCG Live decklist format shown as placeholder" width="240" />
  &nbsp;
  <img src="public/screenshots/2-review.png" alt="Review screen — each card replaced by an illustration-rare or special-illustration-rare printing" width="240" />
  &nbsp;
  <img src="public/screenshots/3-picker.png" alt="Per-card picker — Meowth ex variants with the Special Illustration Rare selected" width="240" />
</p>

## How it works

1. Paste a decklist in standard TCG Live format.
2. Pick **Bling** (rarest available print) or **Simplify** (plainest available print). The setting is sticky in `localStorage`.
3. The app fetches every printing of every card from [pokemontcg.io](https://pokemontcg.io) and ranks them by rarity per your settings.
4. For Pokémon, only printings with identical attacks / abilities / HP are offered as swaps — same-name lookalikes with different stats are filtered out automatically (so an old "Dreepy" with *Infestation* never replaces a current "Dreepy" with *Quick Attack*).
5. Review the result and override any card by tapping it; the picker shows every functionally-identical printing. Manual choices are saved as **per-mode locks** — your Bling locks and Simplify locks are kept separate so they don't fight each other.
6. Copy the upgraded decklist back into TCG Live or share via URL.

### Rarity ranking (default, top = rarest)

1. Special Illustration Rare
2. Hyper Rare / Rare Secret
3. Ultra Rare / Rare Ultra
4. Illustration Rare
5. Double Rare
6. Rare Holo
7. Rare
8. Uncommon
9. Common

Equivalent rarities are tiered together (e.g. older "Rare Secret" and newer "Hyper Rare" are the same thing under different TCG-era names). Within a tier, the newest printing wins by default. Both the order and the tiebreaker are editable in **Settings**.

### Data & caching

Card data comes from [pokemontcg.io](https://pokemontcg.io) and is cached in IndexedDB for 30 days. Anything pokemontcg.io is missing (currently: Mega Evolution Energies, set code `MEE`) is supplemented from a small hand-curated fallback in [`src/api/fallbackPrintings.ts`](src/api/fallbackPrintings.ts).

Share links encode the deck in the URL fragment — recipients open the link and land directly on the review screen with the deck already loaded. No backend involved.

## Develop

```bash
npm install
npm run dev
```

Requires Node 20.19+ or 22.12+ (Vite 8 dependency). `.nvmrc` pins to 22.

## Test

```bash
npm test          # unit + integration (Vitest)
npm run test:e2e  # Playwright mobile-Chrome happy-path
```

## Build

```bash
npm run build
npm run preview
```

## Tech

React + Vite + TypeScript + Tailwind. Vitest + Playwright. Google Analytics 4 for SPA-aware pageview tracking. No backend; deployed as a static SPA on Vercel.

## Contributing

Active work happens on the `dev` branch; `main` mirrors what's deployed on Vercel. Open PRs against `dev`.
