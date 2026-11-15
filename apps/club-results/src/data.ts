import type { CellValue, Column, Metric, Row, Table } from "@bare-bones/core";
import { parseCsvText } from "@bare-bones/core";

export const TEAMS = [
  { name: "Castors", color: "#38BDF8", initials: "CA" },
  { name: "Herons", color: "#E2E8F0", initials: "HE" },
  { name: "Otters", color: "#22C55E", initials: "OT" },
  { name: "Falcons", color: "#F59E0B", initials: "FA" },
  { name: "Lynx", color: "#A78BFA", initials: "LY" },
  { name: "Swifts", color: "#64748B", initials: "SW" },
] as const;

export type TeamName = (typeof TEAMS)[number]["name"];
export type Outcome = "W" | "D" | "L";

const names = TEAMS.map((team) => team.name);
const numberColumn = (id: string, label: string): Column => ({ id, label, type: "number", format: { kind: "number", decimals: 0, locale: "en" } });
const categoryColumn = (id: string, label: string, levels: readonly string[]): Column => ({ id, label, type: "category", format: { kind: "category", levels: [...levels] } });

export const MATCH_COLUMNS: readonly Column[] = [
  { id: "date", label: "Date", type: "date", format: { kind: "date", pattern: "yyyy-mm-dd" } },
  numberColumn("week", "Week"),
  categoryColumn("home", "Home", names),
  categoryColumn("away", "Away", names),
  numberColumn("home-goals", "Home goals"),
  numberColumn("away-goals", "Away goals"),
  { id: "home-outcome", label: "Home outcome", type: "outcome", format: { kind: "category", levels: ["W", "D", "L"] } },
  { id: "away-outcome", label: "Away outcome", type: "outcome", format: { kind: "category", levels: ["W", "D", "L"] } },
];

export const pointsOf = (forGoals: number, againstGoals: number): number =>
  forGoals > againstGoals ? 3 : forGoals === againstGoals ? 1 : 0;
export const outcomeOf = (forGoals: number, againstGoals: number): Outcome =>
  forGoals > againstGoals ? "W" : forGoals === againstGoals ? "D" : "L";

/** Derivation: per-match outcome letters for both sides. */
export function derive(table: Table): Table {
  const rows = table.rows.map((row) => {
    const played = typeof row["home-goals"] === "number";
    const hg = Number(row["home-goals"] ?? 0), ag = Number(row["away-goals"] ?? 0);
    return { ...row, "home-outcome": played ? outcomeOf(hg, ag) : "", "away-outcome": played ? outcomeOf(ag, hg) : "" };
  });
  return { ...table, columns: MATCH_COLUMNS, rows };
}

const isPlayed = (row: Row): boolean => typeof row["home-goals"] === "number";
const timeOf = (value: CellValue | undefined): number => (value instanceof Date ? value.getTime() : 0);
const byDate = (a: Row, b: Row): number => timeOf(a["date"]) - timeOf(b["date"]) || Number(a["week"] ?? 0) - Number(b["week"] ?? 0);

export interface MatchResult { readonly opponent: string; readonly venue: "home" | "away"; readonly score: string; readonly outcome: Outcome }

export interface Standing {
  readonly team: string; readonly played: number; readonly won: number; readonly drawn: number; readonly lost: number;
  readonly goalsFor: number; readonly goalsAgainst: number; readonly goalDifference: number; readonly points: number;
  readonly form: readonly Outcome[]; readonly cumulative: readonly number[]; readonly results: readonly MatchResult[];
}

const blankStanding = (team: TeamName): Standing => ({
  team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0,
  goalDifference: 0, points: 0, form: [], cumulative: [], results: [],
});

export const compareStandings = (a: Standing, b: Standing): number =>
  b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor;

function applyMatch(side: Standing, other: Standing, gf: number, ga: number, venue: "home" | "away"): Standing {
  const outcome = outcomeOf(gf, ga);
  const goalsFor = side.goalsFor + gf, goalsAgainst = side.goalsAgainst + ga;
  const points = side.points + pointsOf(gf, ga);
  const results = [...side.results, { opponent: other.team, venue, score: `${gf}–${ga}`, outcome } as MatchResult];
  return {
    ...side, played: side.played + 1,
    won: side.won + (outcome === "W" ? 1 : 0),
    drawn: side.drawn + (outcome === "D" ? 1 : 0),
    lost: side.lost + (outcome === "L" ? 1 : 0),
    goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst, points, results,
    cumulative: [...side.cumulative, points],
    form: results.slice(-5).map((entry) => entry.outcome),
  };
}

/** Standings aggregated from played matches, sorted (stable on ties). */
export function standings(table: Table): Standing[] {
  const map = new Map<string, Standing>(TEAMS.map((team) => [team.name, blankStanding(team.name)]));
  for (const row of [...table.rows].filter(isPlayed).sort(byDate)) {
    const home = map.get(String(row["home"])), away = map.get(String(row["away"]));
    if (home === undefined || away === undefined) continue;
    const hg = Number(row["home-goals"]), ag = Number(row["away-goals"]);
    map.set(home.team, applyMatch(home, away, hg, ag, "home"));
    map.set(away.team, applyMatch(away, home, ag, hg, "away"));
  }
  return [...map.values()].sort(compareStandings);
}

export interface Fixture {
  readonly date: string;
  readonly week: number;
  readonly home: string;
  readonly away: string;
}

/** First upcoming match, derived from fixture rows (rows without goals). */
export function nextFixture(table: Table): Fixture | null {
  const row = [...table.rows].filter((entry) => !isPlayed(entry)).sort(byDate)[0];
  if (row === undefined) return null;
  return {
    date: row["date"] instanceof Date ? row["date"].toISOString().slice(0, 10) : String(row["date"] ?? ""),
    week: Number(row["week"] ?? 0), home: String(row["home"] ?? ""), away: String(row["away"] ?? ""),
  };
}

/** Headline metrics exposed through the reducer registry. */
export function headlineMetrics(table: Table): Metric[] {
  const table_ = standings(table);
  const leader = table_[0];
  const played = table.rows.filter(isPlayed);
  const goals = played.reduce((sum, row) => sum + Number(row["home-goals"] ?? 0) + Number(row["away-goals"] ?? 0), 0);
  return [
    { id: "leader-points", label: "Leader points", value: leader?.points ?? 0, unit: "pts", detail: leader?.team ?? null },
    { id: "matches", label: "Matches played", value: played.length, unit: null, detail: null },
    { id: "goals", label: "Goals scored", value: goals, unit: null, detail: null },
    { id: "teams", label: "Teams", value: table_.length, unit: null, detail: null },
  ];
}

export const parseCsv = (fileName: string, text: string): Table => parseCsvText(text, { name: fileName }).table;

/** Loads the demo season: played results plus upcoming fixtures. */
export async function loadDemoSeason(baseUrl: string): Promise<Table> {
  const [resultsText, fixturesText] = await Promise.all([
    fetch(`${baseUrl}data/results-2026.csv`).then((r) => r.text()),
    fetch(`${baseUrl}data/fixtures-2026.csv`).then((r) => r.text()),
  ]);
  const results = derive(parseCsv("results-2026.csv", resultsText));
  const fixtures = parseCsv("fixtures-2026.csv", fixturesText);
  return { ...results, rows: [...results.rows, ...fixtures.rows], rejected: [...results.rejected, ...fixtures.rejected] };
}
