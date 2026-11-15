# states-v2 — Tasks

## 1. Core (additive)

- [x] 1.1 `deriveKeyFromPassphrase` (PBKDF2) in `share/crypto.ts`.
- [x] 1.2 `encodePrivateLinkWithPassphrase` / `decodePrivateLinkWithPassphrase` (`v1.k.`).
- [x] 1.3 `decodeLink` rejects `.k.` with `passphrase-required` detail.
- [x] 1.4 Tests: round-trip, wrong passphrase, truncated token.
- [x] 1.5 `docs/CONTRACTS.md` updated.

## 2. UI (additive)

- [x] 2.1 `states/importMachine.ts`: countRows, headerOf, rejectedCsv, faultyIndices.
- [x] 2.2 `states/useImportWorker.ts` hook (real worker, phases, cancel).
- [x] 2.3 `states/ImportProgress.tsx` + `states/ImportResult.tsx`.
- [x] 2.4 `states/LinkStates.tsx` (LinkFallback, PassphrasePrompt) + `useIncomingLink`.
- [x] 2.5 `ShareCard` gains the passphrase option.
- [x] 2.6 State styles in `styles/base.css` (variables only).
- [x] 2.7 Exports + unit tests (machine + link states logic).

## 3. Apps

- [x] 3.1 Budget: `worker.ts`, state A (drop zone, ghost spheres, demo card),
      state B (progress + result + download), state C (fallback + passphrase).
- [x] 3.2 Club: `worker.ts`, state D texts aligned to the board, state C fallback,
      `?demo=1` kept.
- [x] 3.3 `pnpm check` green; both apps ≤ 600 lines.

## 4. Playwright

- [x] 4.1 `@playwright/test` dev dependency + `playwright.config.ts` (vite preview servers).
- [x] 4.2 `tests/e2e/states.spec.ts`: A, B (progress → result → CSV download),
      C tampered, C wrong/right passphrase, D.
- [x] 4.3 All states green locally.
