# club-floodlight — Design

## References

- `design/reference/directions/club-floodlight.html` (layout, colours, type)
- `design/reference/directions/stadium.js` (Three.js night stadium, reused)
- `design/reference/directions/png/club-floodlight.png`, `png/fl-bg.png`
- DESIGN.md § Floodlight: ink `#05070C`, surface `#0A1120`, fg `#EEF2F7`,
  ice accent `#7DD3FC`, W `#22C55E`, D `#64748B`, L `#EF4444`;
  Inter Tight 800/300, Geist Mono.

## Structure

```
apps/club-results/
├─ index.html                 favicon-club.svg, title, description
├─ public/
│  ├─ favicon-club.svg        copy of design/assets/favicon-club.svg
│  ├─ fl-bg.png               image fallback for the stadium
│  └─ data/
│     ├─ results-2026.csv     played matches (weeks 1-8)
│     ├─ fixtures-2026.csv    upcoming matches (weeks 9-10)
│     └─ README.md            data provenance
└─ src/
   ├─ main.tsx                entry, mounts App
   ├─ data.ts                 parse, derive (W/D/L, points, GD), standings,
   │                          form streak, cumulative points, demo loader
   ├─ explorer.config.ts      five registries + Floodlight theme tokens
   ├─ App.tsx                 stadium background + 3 columns + share rail
   ├─ stadium.ts              startStadium(canvas): adapted from stadium.js,
   │                          dynamically imported, returns a cleanup
   ├─ floodlight.css          dark tokens, glass panels, responsive columns
   └─ data.test.ts            unit + PBT (seed 20261111)
```

## Data model

- Core `Table`: one row per played match — `date`, `week`, `home`, `away`,
  `home_goals`, `away_goals`.
- Derivation `match-facts`: per row, `home_points`/`away_points` (3/1/0),
  outcome letters, goal difference.
- Reducer `standings`: headline metrics (leader, matches played, total goals).
  The full standings rows come from pure helpers in `data.ts` (tested).
- Team identity (name, colour, initials) lives in the app config, not in `ui`.

## Standings algorithm

Aggregate per team from derived rows; sort by points, then goal difference,
then goals for; ties keep input order (stable compare, proven by PBT).

## Stadium strategy

`App` renders a `<canvas>` and a `.fl-shade` overlay. On mount it checks WebGL
support; if present it `await import("./stadium.js")` (separate Vite chunk,
weight measured apart) and calls `startStadium(canvas)`. Any failure — no
WebGL context, import error, renderer throw — flips a fallback flag that
shows `fl-bg.png` as a fixed background. The UI never depends on the scene.

## Trade-offs

- Three.js is a club-app-only lazy dependency; the shared skeleton stays at
  three runtime dependencies.
- The conversation screen of the mock (phone C) is out of scope for the app:
  it illustrates where the public link is shared; the app exposes the link in
  the share column instead.
