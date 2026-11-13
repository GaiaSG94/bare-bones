# Code style steering

## TypeScript

- Strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- `type` imports via `import type` (`verbatimModuleSyntax`).
- Zod schemas colocated with the types they validate.

## Structure

- One module = one responsibility. Files ≤ 500 lines, functions ≤ 50 lines.
- No duplicated logic: extract a shared function or module instead.
- Pure logic lives in `core` (testable, no DOM, no React); rendering and
  file-system/network concerns stay in `ui`/apps.
- Constants go in config files, never buried mid-function.
- No comments unless they explain a non-obvious constraint; prefer
  self-describing names.

## Public API

`packages/core` and `packages/ui` expose a frozen public API only
(`docs/CONTRACTS.md`). Apps must not deep-import internals; CI guards it.

## Testing

- Unit tests next to the code (`*.test.ts`).
- Property-based tests with fast-check, fixed seed `20261111`, named after
  the invariant they check (round-trips, idempotence, stability).
- Every guard that matters is a test, not a convention.

## Commits

Small, single-purpose commits; message in imperative mood
(`add date parser fallback`). Never commit secrets.
