# Technical steering

## Stack

- Monorepo **pnpm 10**, TypeScript strict (`tsconfig.base.json`), Node LTS ≥ 20.19.
- **Runtime dependencies are frozen at three**: `zod`, `react`, `react-dom`.
  No chart library, no CSS framework, no state manager, no copyleft license.
- Dev tooling is free: Vite, Vitest, fast-check (PBT, fixed seed `20261111`),
  Playwright, ESLint, GitHub Actions.

## Hard constraints

- Browser-only. No application backend. `#bb=` lives in the URL fragment,
  which is never sent to any server.
- Line budgets outside tests, enforced by `tools/budgets` and blocking CI:
  core ≤ 3 300, ui ≤ 4 400, skeleton ≤ 300, each app ≤ 600.
- Each site ≤ 200 kB gzipped, excluding the lazily-loaded 3D scene.
- Files ≤ 500 lines, functions ≤ 50 lines.
- Code files must not use `dangerouslySetInnerHTML` with unescaped input.
- No sound in any shipped page.
- Apps import only the public API of `core`/`ui` (guarded).

## CI

Total CI time < 5 minutes: lint + typecheck + unit + property tests +
budgets + guards + build, parallelized and cached. If it exceeds 5 minutes,
fix the pipeline, never the timeout.

## Sharing

- Public links: `ViewState` serialized, `CompressionStream('deflate-raw')`,
  base64url.
- Private links: AES-GCM-256 via WebCrypto; the key is appended in the
  fragment after the ciphertext; data never transits a server.
- A corrupted link must show a fallback message, never a broken view.

## Data

All displayed numbers must derive from the demo datasets, never hard-coded.
Prefer open datasets with a compatible license, cited in `data/README.md`;
otherwise generate realistic data and label it "Demo data" in the UI.
