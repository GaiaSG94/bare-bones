# Bare Bones — Devpost description

**Category:** Skeleton Crew · **Built with:** Kiro (IDE, specs, hooks,
steering, property-based tests, power) · **Live:**
https://gaiasg94.github.io/bare-bones/

## What it is

Bare Bones is a skeleton you copy: one command gives you an explorer app, and
the only file you edit is `src/explorer.config.ts` with five registries —
importers, derivations, reducers, views, shareAdapters. Drop a CSV, get a typed
table, filters, home-made SVG charts and a `#bb=` link that reopens the exact
same view. Everything runs in the browser: no server, no database, no account.

The repository ships **two apps from that same skeleton**, with **zero lines
changed** in `packages/core` and `packages/ui` (a hash guard proves it):

| App | Domain | Design |
| --- | --- | --- |
| **Fern Street Budget** | residents' association ledger — income, spending, actual vs plan, rejected rows | Orb: off-white, granular spheres, private encrypted link |
| **Riverside Six** | six-team amateur league — standings, form streaks, fixtures | Floodlight: night stadium in Three.js (lazy, with an image fallback), ice accent, public link |

## The problem

A community group is handed a spreadsheet. Nobody will open it, the usual
tools are too heavy, and running a server is out of the question. The treasurer
needs to show numbers; the members need to read them on a phone; nobody wants
an account.

## What it does, feature by feature

**Import.** Encoding detection (`utf-8`, fallback `windows-1252`, BOM), `;` or
`,`, three date formats, numbers written `1 240,00` or `1,240.00`, type
inference, and every bad row kept aside with its reason. The import runs in a
Web Worker with three visible steps, real counters ("X kept / Y set aside"),
the faulty part of each rejected row highlighted, and a CSV download of the
rejected rows.

**Explore.** Virtualised grid, filters (range, multi-select, text), sorts,
aggregates, derived columns, and seven SVG charts written from scratch (bars,
line, area, distribution, form pills, delta bars, proportional bubbles). Each
chart has a text alternative.

**Share.** Two (three) modes:
- **public** — the view state is deflated and base64url-encoded in the URL
  fragment; the link is compact and reopens the same filters, sort and chart;
- **private** — the whole snapshot is encrypted with AES-GCM-256, the key
  travels after the ciphertext in the fragment and never reaches a server;
- **passphrase** — the key is derived from a passphrase (PBKDF2, 100k), so the
  link alone is useless.

A tampered link shows a fallback message ("This link was changed or cut short.
Nothing was loaded") and never replaces what is already open. The fragment is
never sent to any server.

**Empty, importing, broken.** The V2 design states are implemented in both
apps: the first-visit screen (drop zone, expected columns, ghost spheres, "Load
demo data"), the import screen, the broken-link screen with the passphrase
prompt, and the club's empty season ("No match played yet." / "Load demo
season").

## Same skeleton, two very different apps

`tools/guard.mjs` checks three things on every push: apps import only the
public entry points of core/ui, `dangerouslySetInnerHTML` is banned, and every
file of `packages/core` and `packages/ui` matches `tools/core-ui.sha256`. The
two apps therefore differ by their config, their CSS and their data — not by a
fork of the engine.

## Real numbers (from `site/metrics.json`)

- 77 tests in 12 files, all green; 16 property-based checks (fast-check, seed
  `20261111`);
- core 1 578 lines, ui 2 595, skeleton 70; budget app 598, club app 600
  (ceiling 600 each);
- gzip: home 10.2 kB, budget 116.9 kB, club 111.7 kB, skeleton 93.5 kB — the
  3D scenes are lazy and measured apart (126.3 kB home, 122.1 kB club);
- three runtime dependencies (`zod`, `react`, `react-dom`), `three` only for
  the club stadium;
- CI in 72 s: verify, typecheck, tests, budgets, guards, Playwright, Pages.

## Data

The demo season and the demo ledger are generated (no open dataset with a
compatible licence was found); the club app shows a **Demo data** badge and
`data/README.md` says how the data was produced. Every figure on screen is
computed from those files.

## Try it

Open https://gaiasg94.github.io/bare-bones/ and press **Play the scenario**
(nine steps, two for the club), then open the two cards: they are the real
deployed apps. Or run it locally: `pnpm i && pnpm dev`.

The Devpost thumbnail is `design/assets/devpost-thumbnail-1500x1000.png`.
