# club-floodlight — Tasks

## 1. Package

- [x] 1.1 Scaffold `apps/club-results` (package.json, vite `/club/`, tsconfig, vitest).
- [x] 1.2 Copy `favicon-club.svg` and `fl-bg.png` into `public/`.
- [x] 1.3 `index.html`: English title/description, favicon, viewport.

## 2. Data

- [x] 2.1 Generate demo season CSVs (results + fixtures) and `data/README.md`.
- [x] 2.2 `data.ts`: CSV parse via core, derivation (points, outcome, GD).
- [x] 2.3 Standings, form streak, cumulative points; next match from fixtures.

## 3. Config

- [x] 3.1 `explorer.config.ts`: importer, derivation, reducer, views,
      public share adapter, Floodlight theme tokens.

## 4. UI

- [x] 4.1 `stadium.ts`: lazy Three.js scene with cleanup and failure flag.
- [x] 4.2 `App.tsx`: stadium background + League table / Team / Share columns.
- [x] 4.3 `floodlight.css`: dark glass panels, leader glow, responsive stack.

## 5. Proof

- [x] 5.1 PBT seed 20261111: points conservation, equal played counts, stable sort.
- [x] 5.2 Demo data unit tests (24 matches, 6 teams, fixtures future-dated).
- [x] 5.3 `pnpm check` green: verify, typecheck, tests, budgets, guards.
