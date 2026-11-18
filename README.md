# Bare Bones

> Drop a spreadsheet. Share an *explorer.*

**Bare Bones** is a copy-ready skeleton for in-browser data explorers. Drop a
CSV and you get a typed table, filters, home-made SVG charts and a `#bb=` link
that reopens the exact same view on someone else's phone. No server, no
database, no account — the file never leaves the browser.

Built for **Kiroween 2026 · Skeleton Crew**, with Kiro (specs, hooks, steering,
property-based tests and a power) — see [KIRO.md](KIRO.md).

## Live

| Site | URL |
| --- | --- |
| Home | https://gaiasg94.github.io/bare-bones/ |
| Budget app (Orb) | https://gaiasg94.github.io/bare-bones/budget/ |
| Club app (Floodlight) | https://gaiasg94.github.io/bare-bones/club/ |
| Skeleton starter | https://gaiasg94.github.io/bare-bones/skeleton/ |

## Two apps, one skeleton

| App | What it explores | Design |
| --- | --- | --- |
| `apps/nonprofit-budget` — **Fern Street Budget** | a residents' association ledger: income, spending, actual vs plan | Orb: off-white, granular spheres, private encrypted link |
| `apps/club-results` — **Riverside Six** | a six-team amateur league: standings, form streaks, fixtures | Floodlight: night stadium (Three.js, lazy), ice accent, public link |

Both apps declare the **same five registries** in `explorer.config.ts`
(`importers`, `derivations`, `reducers`, `views`, `shareAdapters`) and change
**zero lines** in `packages/core` and `packages/ui`. That is not a promise, it
is a hash:

```sh
node tools/guard.mjs
# guards: ok (66 frozen core/ui files)
git diff --stat <skeleton-baseline> -- packages/core packages/ui
# (empty)
```

`tools/core-ui.sha256` freezes every core/ui file; any change to them fails CI
until the manifest is deliberately refreshed (`node tools/snapshot-core-ui.mjs`).

## What the skeleton does

1. **Drop a CSV** (or press *Load demo data*). The file is decoded
   (`utf-8`, fallback `windows-1252`, BOM stripped), split (`;` or `,`),
   typed (date / text / category / number / outcome) and every bad row is kept
   aside with its reason.
2. **Explore**: virtualised grid, filters, sorts, aggregates, seven home-made
   SVG charts with a text alternative for each.
3. **Share**: `#bb=` public link (deflate-raw + base64url) or private link
   (AES-GCM-256, key in the fragment, never sent anywhere), plus a
   passphrase-protected variant (`v1.k.`, PBKDF2). A tampered link shows a
   fallback message and never replaces what is already open.

## Numbers (measured, not claimed)

Everything below comes from [`site/metrics.json`](site/metrics.json), produced
by `tools/metrics.mjs`:

| | |
| --- | --- |
| Tests | **79** in 14 files, all green |
| Property-based checks (fast-check, seed `20261111`) | **16** |
| Lines, core / ui / skeleton | **1,578** / **2,595** / **70** |
| Lines, budget app / club app | **598** / **600** (CI gate, ceiling 600 each) |
| Gzip, home page | **10.2 kB** (3D scene 126.3 kB, lazy, measured apart) |
| Gzip, budget app | **116.9 kB** |
| Gzip, club app | **111.7 kB** (3D stadium 122.1 kB, lazy) |
| Gzip, skeleton | **93.5 kB** |
| Runtime dependencies | **3** — `zod`, `react`, `react-dom` (`three` only for the club's stadium) |
| CI | **72 s** (lint, typecheck, tests, budgets, guards, Playwright, Pages) |

Demo data, recomputed from the shipped CSVs: budget **88 rows, 2 set aside**, income **€12,360**, expenses **€8,541**, balance **+€3,819**; league leader **Castors, 22 pts**, next match in week 9.

## Install

```sh
pnpm i
pnpm dev            # all apps (home + budget + club + skeleton)
pnpm test           # unit + property tests
pnpm run e2e        # Playwright on the built sites
pnpm run check      # verify + typecheck + tests + budgets + guards
pnpm doctor         # is this checkout ready?
```

Create a new app from the skeleton:

```sh
node create-bare-bones/index.mjs my-app
```

## Layout

```
packages/core      pure TS: types, import, query, state, share codecs
packages/ui        React kit: grid, filters, SVG charts, share, states
skeleton/          the 70-line starter (one config, one entry point)
apps/nonprofit-budget   Orb app
apps/club-results       Floodlight app
site/              home page (paper/ink/orbit themes, 9-step scenario)
create-bare-bones  CLI that copies the skeleton
power/bare-bones   Kiro power: skill + datasets + review rubric
tools/             doctor, budgets, guards, metrics, static server
.kiro/             specs (EARS), steering, hooks
```

## Data

The demo data is **generated** (no open dataset with a compatible licence was
found): see `apps/club-results/public/data/README.md` and the budget CSVs. The
club app says **Demo data** in its header; every figure on screen is computed
from those files.

## Licence

MIT — see [LICENSE](LICENSE).
