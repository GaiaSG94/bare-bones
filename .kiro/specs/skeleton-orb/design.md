# skeleton-and-orb — Design

## Context

Step 4 proves that the generic kit is actually copyable: `skeleton/` is the
small starter, and `apps/nonprofit-budget/` is a real association use case
with an Orb visual identity.

## Decisions

1. **Starter has no app logic.** Its only domain file is
   `explorer.config.ts`; the package root and UI kit own import, query,
   sharing, rendering, and export.
2. **Budget customisation stays in registries.** The budget config declares
   one CSV importer, one categorisation derivation, one reducer, five views,
   and public/private adapters. Core and UI are not modified for budget
   rules.
3. **Demo data is the source of truth.** The bank statement and voted plan
   are CSV files under `public/data/`. Metrics, bubbles, and bars are
   computed from parsed rows. Two intentionally bad rows demonstrate the
   rejection UI.
4. **Orb CSS is app-owned.** The kit's components remain generic; Orb adds
   the composition, gradients, grain, typography, and three-column rail in
   `orb.css`. The app's tokens drive category colours.
5. **Actual vs plan is derived.** Planned rows are parsed into the same
   table shape with `entry = planned`; all comparisons are computed from
   those rows, not copied from the reference image.

## Testing

- Seven app tests (seed `20261111`): category total conservation, income /
  expense / balance conservation, plan conservation, deterministic rule
  categorisation, and generated category validity.
- Strict typecheck and production builds for starter and budget app.
- Budget guard: starter 70/300, budget 580/600 non-test lines.
