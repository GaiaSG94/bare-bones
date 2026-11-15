# club-floodlight — Requirements (EARS)

## 1. Scope

**Requirement 1.1** — The club app (`apps/club-results`, "Riverside Six") shall
be built only on the frozen public API of `@bare-bones/core` and
`@bare-bones/ui`; zero lines of `packages/core` or `packages/ui` may change.

**Requirement 1.2** — The app shall declare its behaviour through the five
registries of `explorer.config.ts` (importers, derivations, reducers, views,
shareAdapters) and declarative theme tokens.

**Requirement 1.3** — The app shall stay under the 600 non-test line budget
(the 3D stadium scene counts inside the app, not in `ui`).

## 2. Data

**Requirement 2.1** — The app shall import match results CSV with `date`,
`home`, `away`, `home_goals`, `away_goals` columns.

**Requirement 2.2** — When no open-data source with a compatible licence is
available, the app shall ship generated demo data, and the UI shall show a
"Demo data" badge. `data/README.md` shall state how the data was produced.

## 3. Derivations and reducers

**Requirement 3.1** — The app shall derive, per match: outcome W/D/L, points
(3/1/0) and goal difference for each side.

**Requirement 3.2** — The app shall compute the league standings, the form
streak over the last 5 matches, and cumulative points per team. No visible
number shall be hard-coded in the UI.

## 4. Screens (design Floodlight)

**Requirement 4.1** — On desktop, the app shall render the three screens as
columns centred over the night stadium: League table, Team page, and public
Share.

**Requirement 4.2** — The League table shall show crests, the glowing leader
row, and the next match. The Team page shall show the big points total,
W/D/L/GD stats, form pills, a cumulative-points curve, and last results.

**Requirement 4.3** — The app shall offer a compact public `#bb=` share link
as the default share mode.

**Requirement 4.4** — The stadium (Three.js, adapted from
`design/reference/directions/stadium.js`) shall be loaded lazily; when WebGL
is unavailable or the scene fails, the app shall fall back to the `fl-bg.png`
image without losing any functionality.

**Requirement 4.5** — The app shall include the "← Bare Bones" link and stay
readable on a phone with no dedicated mobile work beyond responsive columns.

## 5. Proof

**Requirement 5.1** — Property tests (seed 20261111) shall prove the standings
are consistent: total points awarded equals 3×wins + draws across all matches,
every team plays the same number of matches, and the sort is stable.

**Requirement 5.2** — The app shall typecheck, build under `/club/`, and pass
the guards ("public API only", no `dangerouslySetInnerHTML`).
