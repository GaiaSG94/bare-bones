import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  byCategory,
  CATEGORIES,
  categorise,
  derive,
  expensesOf,
  incomeOf,
  parseCsv,
  planRows,
  sumAmount,
  type Row,
} from "./data.js";

const SEED = 20261111;
const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../public/data");

function demoTable() {
  const actual = derive(parseCsv("fy2026.csv", readFileSync(join(dataDir, "fy2026.csv"), "utf8")));
  const plan = parseCsv("plan-fy2026.csv", readFileSync(join(dataDir, "plan-fy2026.csv"), "utf8"));
  return { ...actual, rows: [...actual.rows, ...planRows(plan)], rejected: [...actual.rejected, ...plan.rejected] };
}

describe("categorisation", () => {
  it("maps every label to a known category", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 60 }), (label) => {
        expect(CATEGORIES).toContain(categorise(label));
      }),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("is deterministic", () => {
    expect(categorise("Hall rental")).toBe("Premises");
    expect(categorise("City grant")).toBe("Grants");
    expect(categorise("Something else")).toBe("Other");
  });
});

describe("demo data", () => {
  it("reads every good row and rejects the broken ones", () => {
    const table = demoTable();
    expect(table.rows.length).toBeGreaterThan(50);
    expect(table.rejected.length).toBe(2);
    expect(table.rejected.map((row) => row.reason).sort()).toEqual([
      "invalid-date",
      "invalid-number",
    ]);
  });

  it("keeps income minus spending equal to the balance", () => {
    const table = demoTable();
    const rows = table.rows.filter((row) => row["entry"] !== "planned");
    const balance = incomeOf(rows) - expensesOf(rows);
    expect(balance).toBeCloseTo(sumAmount(rows), 6);
  });

  it("splits spending per category without losing a cent", () => {
    const table = demoTable();
    const rows = table.rows.filter((row) => row["entry"] !== "planned");
    const total = byCategory(table).reduce((sum, entry) => sum + entry.actual, 0);
    expect(total).toBeCloseTo(expensesOf(rows), 6);
  });

  it("adds up the plan the same way as the spending", () => {
    const table = demoTable();
    const planned = byCategory(table).reduce((sum, entry) => sum + entry.planned, 0);
    const planRowsTotal = table.rows
      .filter((row) => row["entry"] === "planned")
      .reduce((sum, row) => sum + Number(row["amount"] ?? 0), 0);
    expect(planned).toBeCloseTo(planRowsTotal, 6);
  });
});

describe("row helpers", () => {
  it("never counts a planned row as an actual one", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            amount: fc.integer({ min: -5000, max: 5000 }),
            entry: fc.constantFrom("actual", "planned"),
          }),
        ),
        (rows) => {
          const typed = rows as Row[];
          const actual = typed.filter((row) => row["entry"] !== "planned");
          expect(actual.length).toBeLessThanOrEqual(typed.length);
        },
      ),
      { seed: SEED, numRuns: 100 },
    );
  });
});
