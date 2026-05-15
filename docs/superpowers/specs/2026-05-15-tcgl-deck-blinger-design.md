# TCGL Deck Blinger — Design

**Status:** Approved
**Date:** 2026-05-15

## 1. Purpose

A mobile-first React web app that takes a Pokémon TCG Live decklist as input and produces a "blinged" version of the same deck — every card swapped for its rarest available printing — while remaining legal to import back into TCG Live. Cards are functionally identical; only the printing (rarity, art, set) changes.

## 2. Inputs and Outputs

### Input
A decklist in standard TCG Live export format. Example:

```
Pokémon: 21
4 Dreepy TWM 128
4 Drakloak TWM 129
3 Dragapult ex TWM 130
...

Trainer: 32
4 Lillie's Determination MEG 119
...

Energy: 7
2 Fire Energy MEE 2
...
```

Parser rules:
- Section headers (`Pokémon: N`, `Trainer: N`, `Energy: N`) are recognized but the counts are not authoritative — the actual counts come from summing the lines beneath.
- Each card line matches: `<count> <name> <setCode> <number>` where `<name>` may contain spaces, apostrophes, and punctuation.
- Blank lines are ignored.
- Unparseable lines are surfaced as warnings to the user, not silently dropped.

### Output
The same decklist format, with `<setCode>` and `<number>` swapped for the user-selected upgraded printing of each card. Copyable to clipboard and shareable via URL hash (deck encoded in the URL, no backend).

## 3. Data Source

**Primary:** `https://api.pokemontcg.io/v2/cards` — public, CORS-enabled, JSON, no API key required for moderate use.

Fields consumed per card object:
- `name` — card name
- `set.ptcgoCode` — matches the set code used in the TCG Live decklist format
- `number` — card number within the set
- `rarity` — text (`"Rare Holo"`, `"Illustration Rare"`, `"Special Illustration Rare"`, `"Hyper Rare"`, `"Rare Ultra"`, etc.)
- `legalities.standard` — `"Legal"` or absent
- `images.small` / `images.large` — card art URLs

**Card lookup strategy:** query by exact name (`q=name:"<name>"`) to fetch every printing of that card in a single request, then filter/rank client-side.

**No Serebii scraping.** The Serebii route was evaluated and rejected because the API provides clean text rarity, hosted images, CORS support, and exact `ptcgoCode` values without any HTML/icon parsing.

## 4. Architecture

**Stack:**
- React + Vite + TypeScript
- Tailwind CSS (mobile-first by default)
- No backend; static SPA deployable anywhere

**State:** React Context + `useReducer` for the deck and the per-card chosen printings. No external state library.

**Module boundaries** (each independently testable):
- `parser/` — decklist text → structured `Deck` object; pure functions, no I/O
- `api/` — thin client over pokemontcg.io with retry/backoff
- `cache/` — IndexedDB wrapper for printing data; pluggable so tests can inject a fake
- `upgrade/` — pure logic: given a card's printings + user preferences, returns the ranked upgrade order
- `ui/` — React components, organized by screen
- `export/` — deck → TCG Live text, deck → share URL, share URL → deck

**Why these boundaries:** the upgrade ranking and parser are the only pieces with non-trivial logic worth testing in isolation; everything else is glue or I/O. Keeping `upgrade/` and `parser/` pure means we can iterate on ranking rules and parser tolerance without touching the UI.

## 5. Caching

**Why cache:** card data is effectively immutable per printing. Avoiding redundant API calls makes the app feel instant on the second deck and reduces dependency on the API's uptime.

**Storage:** IndexedDB via a small wrapper (e.g. `idb-keyval`).

**Cache key:** normalized card name (lowercased, accents stripped, punctuation collapsed).

**Cache value:** the full list of printings for that card name, plus a `fetchedAt` timestamp.

**TTL:** 30 days. After expiry the entry is refreshed on next access, but the stale value is used as an immediate fallback if the network call fails.

**localStorage** is reserved for user preferences only (small, synchronous, doesn't need IndexedDB's complexity):
- Rarity ranking order
- Tiebreaker preference (newest vs. oldest printing within a rarity tier)
- Locked per-card choices (`cardName → { setCode, number }`)

## 6. Upgrade Logic

**Default rarity ranking** (highest priority → lowest, used when auto-picking the "best" upgrade):

1. Special Illustration Rare
2. Illustration Rare
3. Hyper Rare
4. Rare Ultra
5. Rare Holo
6. Rare
7. Uncommon
8. Common

The ranking is fully user-configurable via drag-and-drop in settings. Unknown rarity strings sort to the bottom.

**Tiebreaker within a rarity tier:** user-configurable — newest printing first (default) or oldest printing first.

**Legality rule:** a card (by name) is considered legal if *at least one* of its printings has `legalities.standard === "Legal"`. When that's true, *all* of its printings are offered as swap candidates, including older printings whose own `legalities.standard` field is absent — because reprints of a card make all printings of that card playable in practice.

Cards with zero Standard-legal printings get a warning badge on the review screen and are exported unchanged.

**Manual override and locking:** if the user manually picks a printing on the review screen, that choice is saved to localStorage as a lock for that card name. Future decks containing the same card auto-select the locked printing instead of the rarity-ranked default. Locks are visible and clearable in settings.

## 7. User Flow

Mobile-first, three screens.

### 7.1 Paste screen
- Full-width textarea, monospace font, placeholder showing the expected format
- Single primary button: "Upgrade Deck"
- On submit: parse → show inline warnings for unparseable lines → navigate to Review

### 7.2 Review screen
Scrollable list, one row per unique card. Each row shows:
- Small thumbnail of the current upgraded printing
- Count and name (`4× Boss's Orders`)
- Current printing (`MEG 114, Uncommon`)
- Upgraded printing (`PAL 248, Hyper Rare`) with a chevron indicating the row is tappable

Tapping a row opens a bottom sheet showing every printing of that card as a grid of full card images, each labeled with set name, set code, number, and rarity. Tapping a card in the sheet selects it and closes the sheet. A "use default ranking" button at the top of the sheet clears any lock for that card.

A sticky footer shows total cards (`60/60 ✓` or `58/60 ⚠`) and an "Export" button.

### 7.3 Export screen
- Read-only formatted decklist in the TCG Live format
- "Copy to clipboard" button
- "Copy share link" button — generates a URL with the deck encoded in the hash fragment so the recipient sees the same deck without any backend involvement
- "Back to review" link

### 7.4 Settings
Reached from a small gear icon on the paste screen. Contains:
- Rarity ranking drag-list
- Newest/oldest tiebreaker toggle
- List of locked card choices with per-row "clear" buttons
- "Clear all locks" and "Clear cached card data" buttons

## 8. Error Handling

- **Unparseable decklist lines:** surfaced as a list of warnings above the parsed deck on the review screen; the user can go back and fix.
- **Card name not found in the API:** the row shows the original printing with a "not found" badge; export uses the original line unchanged.
- **API request fails:** if a cached value exists (even expired), use it and show a small "offline data" indicator. If no cache exists for that card, treat as "not found" per the rule above.
- **Card has no Standard-legal printing:** the row exports unchanged and is badged "not Standard legal".
- **Network completely offline at startup:** the app still loads (it's a static SPA); pasted decks fall back to cached card data only.

## 9. Testing Strategy

- **Unit tests** for `parser/`, `upgrade/`, and `export/` — these are pure functions with clear input/output, easy to cover thoroughly.
- **Integration tests** for `cache/` against a fake IndexedDB.
- **One end-to-end happy-path test** (Playwright or similar): paste the example decklist, verify the review screen shows expected upgraded printings, click export, verify clipboard contents.
- No need for component-level snapshot tests; the UI surface is small.

## 10. Out of Scope (YAGNI)

- User accounts, cloud sync, multi-device sync
- Price comparison or market data
- Deck building from scratch (input must be an existing decklist)
- Image editing or proxy printing
- Deck legality validation beyond per-card Standard legality (no 4-copy rule enforcement, no ACE SPEC checks, etc.) — the input is assumed to already be a valid deck
- Internationalization — English UI only for v1
