# Design system steering

Themes are **declarative**: design tokens, colors, and typography live in
each app's `explorer.config.ts`, never inside `packages/ui`. Two totally
different looks must be achievable on the same components.

## Shared structure

- Layout primitives: sidebar, content columns, metric cards, virtualized
  grid, filter panel, SVG chart slots.
- Every chart has a text equivalent (accessibility).
- English UI only. No third-party brands in the UI.

## Orb — `apps/nonprofit-budget`

- Background off-white `#F4F3F0`; white cards, 22 px radius.
- Fonts: Inter, Geist Mono, one touch of Instrument Serif italic.
- Granular radial-gradient spheres with grain, one color per category.
- Overview: balance "+€X left" with plan sentence; Came in / Went out;
  "Where the money went" proportional bubbles; "Monthly spending" (actual
  bars, plan dashed); typed filterable table; black "Share with members"
  card (private/public, copyable link); "Rejected rows"; "Actual vs plan".
- Sidebar: Overview, Transactions, Categories, Actual vs plan, Rejected
  rows, plus a "Your data stays here" notice.
- Back button "← Bare Bones" top-left, to the home page.

## Floodlight — `apps/club-results`

- Background: night stadium Three.js scene, lazily loaded, with image
  fallback (`png/fl-bg.png`) when WebGL is unavailable or slow. Light blur
  and left-side darkening are mandatory for readability.
- Fonts: Inter Tight 800/300, Geist Mono; ice-blue accent `#7DD3FC`;
  W/D/L in green, grey, red.
- League table: crests, glowing leader row, next match. Team page: big
  points total, W/D/L/GD, form pills, cumulative-points curve, recent
  results. Public sharing.
- On desktop the views sit in center columns over the stadium; the club
  screens must stay readable on a phone.
- Back button "← Bare Bones".

## Home page (`site/`)

Reference: `design/reference/planches/planche-01.html` — technical frame
with hatched band, bone logo nav (Overview / Pipeline / Architecture /
Sharing / Numbers), Kiroween chip, Ink/Paper/Orb theme switcher (Paper
default), "Drop a spreadsheet. Share an *explorer.*", problem/answer block,
"Who's involved · 6 parties" band, wireframe Three.js spine sculpture,
"Play the scenario" button (9 steps), and two real app cards
(`./budget/`, `./club/`). All numbers come from `site/metrics.json`,
never hard-coded.
