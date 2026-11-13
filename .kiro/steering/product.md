# Product steering

## What Bare Bones is

A copyable skeleton for in-browser data explorers. One line: **Drop a
spreadsheet. Share an explorer.** Drop a CSV, get a typed table, filters,
SVG charts, and a `#bb=` URL fragment that reopens the exact same view.

Everything runs in the browser: no backend, no database, no account.
The URL fragment never leaves the client.

## Why (Potential Impact)

Small organisations (neighborhood nonprofits, sports clubs) live in
spreadsheets and email attachments. Their members cannot explore data
without Excel skills, and installing a BI stack is out of reach. Bare Bones
turns any CSV into a shareable explorer in two clicks, with nothing to host.

## The skeleton contract

- `packages/core`: pure TypeScript, zero DOM access, zero React.
- `packages/ui`: React kit, zero business logic.
- Apps personalize **only** through five registries declared in
  `explorer.config.ts`: `importers`, `derivations`, `reducers`, `views`,
  `shareAdapters`. Apps never modify `core` or `ui` — a CI guard proves it.
- `skeleton/` is the minimal starter (< 300 lines outside tests).

## The two proof apps

1. **Fern Street Budget** (`apps/nonprofit-budget`) — nonprofit statement
   CSV, realized vs plan by category, private encrypted share links.
2. **Riverside Six** (`apps/club-results`) — match results, standings,
   form streaks, compact public share links.

## Non-goals

- Mobile-first layout (except the club screens, which must stay readable).
- Multi-user editing, persistence beyond the URL fragment, auth.
- Any third-party branding in the UI or demo video.
