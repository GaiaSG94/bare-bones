# Riverside Six — demo season data

There is **no open-data source** behind these files: no amateur-league
results dataset with a compatible licence was found at build time, so the
season was **generated for the demo**. The app therefore shows a
**"Demo data"** badge. Team names, colours and results are fictional.

## Files

- `results-2026.csv` — the 24 played matches of weeks 1–8.
- `fixtures-2026.csv` — the 6 upcoming matches of weeks 9–10 (no score).

## Format

```
date,week,home,away,home_goals,away_goals
2026-09-05,1,Castors,Swifts,2,1
```

- `date`: ISO `yyyy-mm-dd` (the importer also accepts `dd/mm/yyyy`).
- `week`: round number.
- `home` / `away`: team names from the fixed 6-team roster.
- Goals are integers; fixture rows omit the goal columns.

## Structure

Double round-robin: every pair of the 6 teams meets twice (once at each
team's ground), 30 matches over 10 weeks, 3 matches per week.

Every number displayed in the app (standings, points, form, goal
difference, cumulative curves) is derived from these CSVs by
`@bare-bones/core` plus the app's own registries — nothing is hard-coded.
