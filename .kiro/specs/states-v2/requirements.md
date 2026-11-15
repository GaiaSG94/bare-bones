# states-v2 — Requirements (EARS)

Reference: `design/reference/directions/states.html` (design V2, 2026-11-14).
The four states are reproduced on desktop, in both apps, with the exact
English texts of the board. Displayed counters are always real values.

## 1. Shared machinery (additive, public API only)

**Requirement 1.1** — Core shall support a passphrase-protected private
link (`v1.k.`): the key is derived from the passphrase (PBKDF2, WebCrypto)
and never travels in the fragment. The API change is additive; existing
`v1.p.` and `v1.s.` links keep working.

**Requirement 1.2** — UI shall expose generic state components (import
progress, import result with rejected rows, link fallback, passphrase
prompt) driven only by CSS variables; apps compose them and style them.

**Requirement 1.3** — The import progress shall run on the real import
Worker: the app posts bytes to a worker built on `attachWorker`; the three
steps (columns recognised, rows checked in the background worker,
explorer built) reflect real phases, never fake ones.

**Requirement 1.4** — The result card shall show real kept / set-aside
counts, list the rejected rows with the faulty part highlighted, and
offer "Download rejected rows" as a real CSV download.

## 2. State A — budget, first visit

**Requirement 2.1** — With no data, the budget app shall show the drop
zone (title, safety line, expected columns `date / label / category /
amount`, "Choose a file"), the dimmed ghost spheres with the caption
"Your categories become spheres, sized by spend", and the demo card
"Just looking? … Load demo data".

**Requirement 2.2** — The "← Bare Bones" link and "No data yet" chip
shall be visible.

## 3. State B — import

**Requirement 3.1** — While a file is being imported, the app shall show
the file name with its size, the progress track, and the three steps
with the current phase marked, plus a Cancel action.

**Requirement 3.2** — When the import finishes, the app shall show
"Ready. N rows in your explorer." with "N kept" and "M set aside" pills
(M = `table.rejected.length`), the rejected rows, and both actions.

## 4. State C — shared link

**Requirement 4.1** — When the `#bb=` token cannot be decoded, the app
shall show the fallback panel ("This link was changed or cut short.")
and load or replace nothing; any data already opened stays untouched.

**Requirement 4.2** — When the token is a passphrase link (`v1.k.`), the
app shall show the passphrase prompt; a wrong passphrase shows "That
passphrase doesn't open this link…", the right one opens the snapshot.

**Requirement 4.3** — The budget app shall let the sender protect a
private link with a passphrase (share card gains the option).

## 5. State D — club, first visit

**Requirement 5.1** — With no data, the club app shall show the
Floodlight empty state: "Riverside Six · Season 2026", "No match played
yet.", the pitch line, "Load demo season" and "Drop results.csv", the
"← Bare Bones" link — over the stadium or its image fallback.

## 6. Proof

**Requirement 6.1** — Every state shall be covered by a Playwright test
(real browser, built apps): texts, counters, download, wrong/right
passphrase, tampered link fallback.

**Requirement 6.2** — Line budgets hold: core ≤ 3 300, ui ≤ 4 400,
skeleton ≤ 300, each app ≤ 600. Both apps keep `pnpm check` green.
