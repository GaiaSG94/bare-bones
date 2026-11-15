import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { expensesOf, incomeOf, actualRows } from "./data.js";
import { parseCsv } from "./data.js";

const here = dirname(fileURLToPath(import.meta.url));
const metrics = JSON.parse(readFileSync(resolve(here, "../../../site/metrics.json"), "utf8")) as {
  demo: { budget: { rows: number; rejected: number; income: number; expenses: number; balance: number } };
};

describe("metrics.json matches the real app numbers", () => {
  it("reports the same budget totals as the app", () => {
    const csv = readFileSync(resolve(here, "../public/data/fy2026.csv"), "utf8");
    const table = parseCsv("fy2026.csv", csv);
    const rows = actualRows(table);
    const income = Math.round(incomeOf(rows));
    const expenses = Math.round(expensesOf(rows));
    expect(metrics.demo.budget.rows).toBe(rows.length);
    expect(metrics.demo.budget.rejected).toBe(table.rejected.length);
    expect(metrics.demo.budget.income).toBe(income);
    expect(metrics.demo.budget.expenses).toBe(expenses);
    expect(metrics.demo.budget.balance).toBe(income - expenses);
  });
});
