import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareStandings,
  derive,
  parseCsv,
  nextFixture,
  outcomeOf,
  pointsOf,
  standings,
  TEAMS,
  type Standing,
} from "./data.js";

const SEED = 20261111;
const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../public/data");

function demoSeason() {
  const results = derive(parseCsv("results-2026.csv", readFileSync(join(dataDir, "results-2026.csv"), "utf8")));
  const fixtures = parseCsv("fixtures-2026.csv", readFileSync(join(dataDir, "fixtures-2026.csv"), "utf8"));
  return { ...results, rows: [...results.rows, ...fixtures.rows] };
}

describe("demo season", () => {
  it("holds 24 played matches between the six known teams", () => {
    const table = demoSeason();
    const played = table.rows.filter((row) => typeof row["home-goals"] === "number");
    expect(played).toHaveLength(24);
    for (const row of played) {
      expect(TEAMS.map((team) => team.name)).toContain(String(row["home"]));
      expect(TEAMS.map((team) => team.name)).toContain(String(row["away"]));
    }
  });

  it("keeps the standings totals consistent with the matches", () => {
    const table = demoSeason();
    const rows = standings(table);
    const matches = table.rows.filter((row) => typeof row["home-goals"] === "number");
    const matchPoints = matches.reduce(
      (sum, row) => sum + pointsOf(Number(row["home-goals"]), Number(row["away-goals"])) + pointsOf(Number(row["away-goals"]), Number(row["home-goals"])),
      0,
    );
    expect(rows.reduce((sum, row) => sum + row.points, 0)).toBe(matchPoints);
  });

  it("gives every team the same number of played matches", () => {
    const rows = standings(demoSeason());
    expect(new Set(rows.map((row) => row.played))).toEqual(new Set(rows.map(() => rows[0]!.played)));
  });

  it("derives the next fixture from unplayed rows", () => {
    const next = nextFixture(demoSeason());
    expect(next?.week).toBe(9);
    expect(next?.home).toBe("Otters");
    expect(next?.away).toBe("Castors");
  });
});

describe("standings properties", () => {
  const goalArb = fc.integer({ min: 0, max: 9 });
  const matchArb = fc.record({ homeGoals: goalArb, awayGoals: goalArb });

  it("conserves points for any set of matches", () => {
    fc.assert(
      fc.property(fc.array(matchArb, { maxLength: 40 }), (matches) => {
        const csv = ["date,week,home,away,home-goals,away-goals", ...matches.map((m) => `2026-01-01,1,Castors,Herons,${m.homeGoals},${m.awayGoals}`)].join("\n");
        const table = derive(parseCsv("results.csv", csv));
        const rows = standings(table);
        const awarded = matches.reduce(
          (sum, m) => sum + pointsOf(m.homeGoals, m.awayGoals) + pointsOf(m.awayGoals, m.homeGoals),
          0,
        );
        return rows.reduce((sum, row) => sum + row.points, 0) === awarded;
      }),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("sorts by points, then goal difference, and stays stable on full ties", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ team: fc.constantFrom(...TEAMS.map((t) => t.name)), points: fc.integer({ min: 0, max: 30 }), goalDifference: fc.integer({ min: -20, max: 20 }) }), { minLength: 2, maxLength: 12 }),
        (input) => {
          const asStanding = input.map((entry) => ({ ...entry, goalsFor: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsAgainst: 0, form: [], cumulative: [], results: [] }) as unknown as Standing);
          const sorted = [...asStanding].sort(compareStandings);
          for (let i = 1; i < sorted.length; i++) {
            const a = sorted[i - 1]!;
            const b = sorted[i]!;
            if (b.points !== a.points) continue;
            if (b.goalDifference !== a.goalDifference) continue;
            const aIndex = asStanding.indexOf(a);
            const bIndex = asStanding.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1 && aIndex < bIndex) continue;
            return false;
          }
          return true;
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("maps every score to an outcome and its points", () => {
    fc.assert(
      fc.property(goalArb, goalArb, (forGoals, againstGoals) => {
        const outcome = outcomeOf(forGoals, againstGoals);
        const points = pointsOf(forGoals, againstGoals);
        return points === (outcome === "W" ? 3 : outcome === "D" ? 1 : 0);
      }),
      { seed: SEED, numRuns: 100 },
    );
  });
});
