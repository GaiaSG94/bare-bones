# submission-polish — Design

## 1. Social preview image

The image file `design/assets/social-preview-1280x640.png` already exists.
`site/public/` already contains a copy (committed).  Vite copies everything
in `site/public/` to the output root during build, so the image is already
present in the build.  The only missing piece is that the meta tags use a
relative path (`./social-preview-1280x640.png`) instead of the absolute URL
that crawlers require for Open Graph.

**Fix**: replace both meta tag values in `site/src/index.html` with the
absolute URL `https://gaiasg94.github.io/bare-bones/social-preview-1280x640.png`.

**Test**: add a Vitest test in `tests/social-preview.test.ts` that reads the
built `site/dist/` directory and asserts that `social-preview-1280x640.png`
exists.  This keeps the check close to the CI pipeline and runs without
Playwright.

## 2. Demo budget balance

The current `fy2026.csv` has income of ~€12,456 and expenses of ~€15,474,
giving a balance of ~−€3,018.  The plan totals ~€9,375 in spending, so
actual spending already exceeds the plan.

Target: income ~€12,500, expenses ~€8,900, balance ~+€3,600.  This is
credible for a small neighbourhood association with 120–150 members, three
city grants, and regular room-hire income.

Changes to `fy2026.csv`:
- Replace the anomalous `2026-05-04;City grant;-1800,00` (a negative grant
  that is not documented and distorts the story) with a small reconciliation
  entry of `2026-05-06;Overpayment refund;-120,00`.
- Remove the large one-off outlier expenses that exceed what a small
  association would realistically incur against a ~€9,375 annual plan:
  the summer picnic (−€820), the sports day supplies (−€421), the marquee
  hire (−€380), the tool library (−€145), the library talk (−€180), the
  storage unit rental (−€400), and the bike rack (−€180).  Replace several
  with smaller, more proportionate versions where it makes the narrative
  richer (e.g. summer picnic → summer picnic catering at −€190).
- Keep all twelve monthly membership dues entries, all grant entries, all
  room hire entries, and all fixed-cost entries (insurance, electricity,
  internet, water, bank fees) unchanged.
- Keep the three broken rows at the bottom unchanged.

The plan file `plan-fy2026.csv` is not changed: it sets the benchmark.

After editing the CSV, run `pnpm metrics` to regenerate `site/metrics.json`,
and update the one line in `README.md` that cites those figures.

## 3. Broken accents in STATUS.md

The file was written in Windows-1252 or Latin-1 and re-interpreted as
UTF-8, producing sequences like `├®` (é), `├á` (à), `├®` (è), `├«` (ê),
`ÔÇö` (—), `ÔÇ£` ("), `ÔÇ¥` ("), `┬½` («), `┬╗` (»), `ÔåÆ` (→), `ÔÇª` (…),
`ÔÇÿ` ('), `┬╗` (»), `├¬` (ê), `├®` (é), `├á` (à), `├á` (à), `ÔëÄ` (+),
`ÔëÊ` (±).

The fix is a targeted search-and-replace pass over every mojibake sequence
present in the file, leaving the `## Claude` section byte-for-byte unchanged.
