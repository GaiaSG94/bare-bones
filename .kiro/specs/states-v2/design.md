# states-v2 — Design

## Split of responsibilities

| Piece | Where | Why |
| --- | --- | --- |
| Passphrase key derivation + `v1.k.` codec | `packages/core` (additive) | crypto belongs to core; both apps open such links |
| Import state machine, worker hook, rejected-rows CSV, faulty-part highlight | `packages/ui/src/states/` (additive) | generic, reused by both apps |
| State screens markup + Orb/Floodlight skins | `apps/*` | app-owned design, counted in the app budget |
| Tests | core (vitest), ui (vitest), `tests/e2e` (Playwright) | |

## `v1.k.` token format

```
#bb=v1.k.<base64url(salt 16B)>.<base64url(iv ‖ ciphertext)>
```

- Key = PBKDF2-SHA-256(passphrase, salt, 100 000 iterations) → AES-GCM-256.
- The key never travels in the fragment; a wrong passphrase fails the
  GCM authentication and surfaces as `BareBonesError` (`invalid-share`).
- `decodeLink` throws with detail `passphrase-required` on `.k.` tokens;
  apps then show the passphrase prompt and call
  `decodePrivateLinkWithPassphrase`.

## Import flow (real worker)

1. App passes `createWorker: () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`; the worker file is 2 lines calling `attachWorker(self)`.
2. `useImportWorker` hook: decodes the text (`decodeText`), counts rows and
   reads the header (real counters), posts `{id, name, bytes}` to the
   worker, flips phases `columns → rows → building → done`.
3. `ImportProgress` renders the three steps + track; `ImportResult`
   renders kept / set-aside pills, the rejected rows (faulty cells
   highlighted via `faultyIndices`, computed with core's `detectDelimiter`
   + `splitCsv` + the table columns), and downloads the CSV itself
   (`escapeCsvField`).

## Link handling in apps

`useIncomingLink({ decode })` — the app supplies `decode(token, passphrase?)`
(its own adapters). States: `none | ready | invalid | locked`. `invalid`
renders `LinkFallback` and touches no data; `locked` renders
`PassphrasePrompt` (dark panel, error line on wrong passphrase).

## Budgets

- core: +≈60 lines (crypto + link) → ≈1 560/3 300.
- ui: +≈260 lines (states folder + css + ShareCard passphrase) → ≈2 100/4 400.
- apps: composition only; `orb.css`/`explorer.config.ts` compacted so both
  apps stay ≤ 600.
