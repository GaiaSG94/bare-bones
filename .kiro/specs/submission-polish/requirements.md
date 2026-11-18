# submission-polish — Requirements (EARS)

## 1. Social preview image

**Requirement 1.1** — When a crawler requests the home page, it shall find
`og:image` and `twitter:image` pointing to the absolute URL
`https://gaiasg94.github.io/bare-bones/social-preview-1280x640.png`.

**Requirement 1.2** — The site build shall include
`social-preview-1280x640.png` at the output root so that the absolute URL
resolves to a valid image after deployment.

**Requirement 1.3** — A test shall fail if `social-preview-1280x640.png` is
absent from the built site's output directory.

## 2. Demo budget balance

**Requirement 2.1** — The budget demo shall show a positive balance (income
exceeds total spending) when the demo data is loaded.

**Requirement 2.2** — The total actual spending in the demo shall be below
the total planned spending declared in `plan-fy2026.csv`.

**Requirement 2.3** — The demo dataset shall keep exactly one row with an
impossible date, one row with an invalid amount, and one empty row (the
three deliberately broken rows that demonstrate the rejected-row feature).

**Requirement 2.4** — No displayed amount shall be hard-coded: every figure
shall be computed from the CSV files at runtime and at metrics time.

**Requirement 2.5** — After adjusting the CSV, `pnpm metrics` shall be run
and `site/metrics.json` shall reflect the new numbers. The drift test in
`metrics.test.ts` shall remain green.

## 3. Broken accents in STATUS.md

**Requirement 3.1** — Every mojibake sequence in STATUS.md (for example
`├®` for `é`, `├á` for `à`, `ÔÇö` for `—`) shall be replaced with the
correct UTF-8 character.

**Requirement 3.2** — After the fix, `grep -c "├" STATUS.md` shall return 0.

**Requirement 3.3** — The `## Claude` section shall not be modified.
