# Skill: new-explorer-app

Build a new data explorer on Bare Bones without touching `packages/core`
or `packages/ui`.

## 1. Copy the skeleton

```bash
node create-bare-bones/index.mjs my-app        # -> apps/my-app
```

The new app is one config file (`src/explorer.config.ts`) plus one entry
point (`src/main.tsx`). Keep it under 600 non-test lines: the line-budget
guard fails above that.

## 2. Fill the five registries

```ts
export const explorerConfig: ExplorerConfig = {
  id: "my-app",
  title: "My app",
  importers: [csvImporter],        // how the file is read
  derivations: [myDerivation],     // what is computed per row
  reducers: [myReducer],           // the headline numbers
  views: [table, chart, rejected], // what the user looks at
  shareAdapters: [publicAdapter],  // how the view is shared
  theme: { colors, fonts, radii, spacing },
  i18n: { locale: "en", strings: {} },
};
```

Rules:
- No business logic in `ui`: derivations and reducers are pure functions
  the app owns and tests.
- Every number shown must be computed from the data (no hard-coded
  totals); the demo data must reproduce the same totals.
- Themes are declarative tokens only; never hard-code a colour in `ui`.

## 3. Prove it

```bash
pnpm --filter @bare-bones/my-app test
pnpm run typecheck
node tools/budget.mjs
node tools/guard.mjs        # public API only, frozen core/ui, no sound
```

Property tests (fast-check, seed 20261111) for the invariants of your
domain: totals conserved, sort stable, filters idempotent, codec
round-trip.

## 4. Design

Two apps in this repo show the range: Orb (daylight, spheres, private
link) and Floodlight (night stadium, ice accent, public link). Pick one
visual language, keep the five registries, and make the empty state say
what the app expects ("drop a results.csv", "drop a ledger.csv").
