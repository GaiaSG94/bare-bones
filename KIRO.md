# How Kiro was used — Bare Bones (Kiroween 2026 · Skeleton Crew)

An honest record of how the project was built with Kiro. Everything below
points at a real file in this repository.

## 1. Specs first (EARS), then code

Eight specs live in `.kiro/specs/`, each with `requirements.md` (EARS),
`design.md` and `tasks.md`:

| Spec | Scope |
| --- | --- |
| `core-types` | the frozen type surface (`Table`, `Column`, `ViewState`, the five extension points) |
| `core-import` | encoding detection, delimiter, dates, numbers, rejected rows |
| `core-query` | filters, sorts, aggregates, derived columns |
| `core-share` | the `#bb=` codecs: public, private AES-GCM, passphrase (`v1.k.`) |
| `ui-kit` | grid, filters, charts, share card, declarative theme |
| `skeleton-orb` | the starter + the Orb budget app |
| `club-floodlight` | the Floodlight club app (3D stadium, lazy + image fallback) |
| `states-v2` | the empty / importing / broken-link states of the V2 design |

**Specs vs vibe coding.** The specs came first and stayed the source of truth
for the contracts: `docs/CONTRACTS.md` describes the same API and the
"public API only" guard enforces the boundary. When the design V2 added the
passphrase link, the work started as `states-v2/requirements.md`
(Requirement 1.1), then the additive API in `packages/core/src/share/link.ts`,
then the tests. Vibe coding would have edited `core` in place and broken the
frozen surface; the spec made the additive shape obvious before any code.

## 2. Steering

`.kiro/steering/` holds four documents that shaped every file:

- `product.md` — what the product is, who it serves (dev team, treasurer,
  members, sports club, Kiro, no server);
- `tech.md` — three runtime dependencies, browser-only, the five registries,
  the frozen core/ui contract;
- `code-style.md` — files under 500 lines, functions under 50, no comments
  unless they explain a decision;
- `design-system.md` — the Orb and Floodlight tokens (colours, type, radii).

The steering is why the club app could be written after the budget app without
touching `ui`: both consume the same tokens declaratively.

## 3. Hooks

`.kiro/hooks/hooks.json` declares three hooks:

| Hook | When | Command |
| --- | --- | --- |
| `test-on-save` | on save (`.ts`, `.tsx`) | `pnpm exec vitest run --changed` |
| `budget-guard` | on save (`src`, `site`) | `node tools/budget.mjs` |
| `public-api-guard` | on save (`apps`, `skeleton`, `site`) | `node tools/guard.mjs` |

The hooks run the exact commands CI runs (`.github/workflows/ci.yml`), so the
fast loop and the gate cannot drift. During the build the same three commands
were also run by hand at every step (`pnpm run check`).

## 4. Property-based testing (fast-check, seed `20261111`)

16 properties across core and the two apps (77 test cases in 12 files):

| Property | Where | What it protects |
| --- | --- | --- |
| `#bb=` codec round-trip | `packages/core/src/share/link.test.ts` | the public and private tokens rebuild the same payload |
| altered link → fallback | same file | no raw parser error ever reaches the UI |
| number / date parsing | `packages/core/src/import/*.test.ts` | `1 240,00` and `1,240.00` both parse, `31/02/2026` is rejected |
| filter idempotence | `packages/core/src/state/view-state.test.ts` | applying a filter twice equals applying it once |
| standings points conservation | `apps/club-results/src/data.test.ts` | sum of points == 3×wins + draws |
| equal matches per team | same file | every team plays the same number of games |
| stable sort | same file | ties keep input order |
| category mapping | `apps/nonprofit-budget/src/data.test.ts` | every label maps to a known category |

Two real bugs were found by these tests during the build:

- **Column ids**: the club CSV headers used underscores (`home_goals`), but
  core's `slugify` turns `_` into `-`, so the derived columns were empty. The
  demo-season test caught it (`expected [] to have a length of 24`) and the
  headers were renamed to `home-goals` everywhere.
- **Structural rejections**: `faultyIndices` first returned the cell indices
  for an empty line; the unit test expected the whole row to be flagged. The
  function now returns `null` for structural failures and the UI highlights the
  whole raw row.

## 5. The Kiro power

`power/bare-bones/` is a power an agent can load to build a new explorer:

- `POWER.md` — when it activates (create/copy/review an explorer app);
- `skill/new-explorer-app/SKILL.md` — copy the skeleton, fill the five
  registries, prove it (tests, budgets, guards), pick a visual language;
- `datasets/` — two small reference CSVs (association ledger, league week);
- `rubric.md` — the 8-line review rubric (registries, real numbers, rejected
  rows, share, budgets, tests, empty state, accessibility).

The power is the answer to "can Kiro build a third app from this skeleton
without a human reading the code?".

## 6. MCP

No MCP server is shipped: the product has no backend, and every tool the agent
needed (tests, budgets, guards, the static server for Playwright) is a plain
Node script in `tools/`. The repository stays runnable offline.

## 7. IDE vs CLI

- **IDE**: the specs, steering, hooks and design references were read and
  edited there; the hooks fire on save.
- **CLI / agent loop**: the implementation ran as an agent loop driven by the
  specs, with `pnpm run check` and Playwright as the gate.
- **Difference**: the IDE is where contracts are read and the hooks give
  instant feedback; the agent loop is where code and tests are produced in
  bulk. The specs are what makes the two interchangeable.

## 8. What the guards prove

```sh
node tools/guard.mjs      # public API only, frozen core/ui, no sound
node tools/budget.mjs     # lines + 200 kB gzip per site (3D measured apart)
pnpm run e2e              # Playwright on the four built sites
```
