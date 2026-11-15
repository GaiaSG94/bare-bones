# Review rubric for a new Bare Bones app

Score each line 0-2. Below 10/16, the app is not ready to ship.

| # | Check | 0 | 1 | 2 |
| --- | --- | --- | --- | --- |
| 1 | Five registries only | core/ui edited | one registry missing | all five declared, core/ui untouched |
| 2 | Real numbers | hard-coded totals | some computed | every figure computed from the data |
| 3 | Rejected rows | dropped silently | counted | listed with the faulty part highlighted |
| 4 | Share link | none | public only | public + private (or passphrase), altered link falls back |
| 5 | Budgets | exceeded | close | under (core/ui/skeleton/app lines, 200 kB gzip) |
| 6 | Tests | none | unit only | unit + property-based (seed 20261111) |
| 7 | Empty state | blank screen | text only | says what to drop, offers demo data |
| 8 | Accessibility | unlabelled | partial | labelled controls, text alternative for charts |

## Review commands

```bash
pnpm run typecheck && pnpm run test
node tools/budget.mjs && node tools/guard.mjs
pnpm run e2e
```
