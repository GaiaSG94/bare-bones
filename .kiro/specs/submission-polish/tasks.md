# submission-polish — Tasks

- [x] Fix `og:image` and `twitter:image` in `site/src/index.html` to use
      the absolute URL.
- [x] Add `tests/social-preview.test.ts` that asserts the image exists in
      the built `site/dist/` output.
- [x] Adjust `apps/nonprofit-budget/public/data/fy2026.csv` so the demo
      ends with a positive balance and total spending stays below the plan.
- [x] Run `pnpm metrics` and commit the updated `site/metrics.json`.
- [x] Update the one demo-figures line in `README.md` to match the new
      metrics.
- [x] Repair mojibake accents in STATUS.md (all sections except `## Claude`).
- [x] Run `pnpm run check` and confirm everything is green.
- [x] Commit changes with clear messages on `kiro/finitions`.

## Polish round 2 — CI and cross-platform fixes

- [x] Move the social-preview check into the Playwright e2e suite:
      add `tests/e2e/social-preview.spec.ts` (HTTP 200 for the image,
      `og:image` and `twitter:image` hold the absolute GitHub Pages URL)
      and delete `apps/nonprofit-budget/src/social-preview.test.ts`.
- [x] Make the core/ui manifest check line-ending-independent:
      normalise `\r\n` → `\n` before hashing in both
      `tools/snapshot-core-ui.mjs` and `tools/guard.mjs`, sharing a helper
      so the logic is not duplicated.
- [x] Run `pnpm run check` and confirm it passes without regenerating
      `tools/core-ui.sha256`.
- [x] Run `pnpm run build` then `pnpm run e2e` and confirm everything is green.
- [x] Commit the changes.
