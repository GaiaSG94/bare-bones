import type { CellValue, Column, Table } from "@bare-bones/core";
import { parseCsvText } from "@bare-bones/core";

export const CATEGORIES = [
  "Membership", "Grants", "Activities", "Events", "Premises", "Fixed costs", "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Row = Record<string, CellValue>;

const RULES: readonly [RegExp, Category][] = [
  [/dues|membership|subscription/i, "Membership"],
  [/grant|subsid|funding|sponsor/i, "Grants"],
  [/workshop|materials|craft|supplies|play scheme|art class/i, "Activities"],
  [/party|picnic|raffle|event|parade|permits/i, "Events"],
  [/hall|rent|cleaning|repaint|marquee/i, "Premises"],
  [/insurance|electric|internet|water|account/i, "Fixed costs"],
];

export function categorise(label: string): Category {
  for (const [pattern, category] of RULES) {
    if (pattern.test(label)) return category;
  }
  return "Other";
}

export function monthOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const COLUMNS: readonly Column[] = [
  { id: "date", label: "Date", type: "date", format: { kind: "date", pattern: "yyyy-mm-dd" } },
  { id: "label", label: "Label", type: "text", format: { kind: "text" } },
  { id: "category", label: "Category", type: "category", format: { kind: "category", levels: [...CATEGORIES] } },
  { id: "amount", label: "Amount", type: "number", format: { kind: "number", decimals: 2, locale: "fr" } },
];

/** Derivation: category by rules, month of the row. */
export function derive(table: Table): Table {
  const rows = table.rows.map((row) => {
    const date = row["date"];
    return { ...row, category: categorise(String(row["label"] ?? "")), month: date instanceof Date ? monthOf(date) : "" };
  });
  return { ...table, columns: [...COLUMNS], rows };
}

/** Turns the plan file into rows of the same table (entry = planned). */
export function planRows(plan: Table): Row[] {
  return plan.rows.map((row): Row => {
    const month = String(row["month"] ?? "");
    const category = String(row["category"] ?? "Other");
    const planned = typeof row["planned"] === "number" ? row["planned"] : 0;
    const [year = "2026", monthPart = "01"] = month.split("-");
    return { date: new Date(Date.UTC(Number(year), Number(monthPart) - 1, 1)), label: category, category, entry: "planned", month, amount: planned };
  });
}

export function parseCsv(fileName: string, text: string): Table {
  return parseCsvText(text, { name: fileName }).table;
}

/** Loads the demo bundle: real transactions plus the budget voted at the meeting. */
export async function loadDemoBundle(baseUrl: string): Promise<Table> {
  const [actualText, planText] = await Promise.all([
    fetch(`${baseUrl}data/fy2026.csv`).then((r) => r.text()),
    fetch(`${baseUrl}data/plan-fy2026.csv`).then((r) => r.text()),
  ]);
  const actual = derive(parseCsv("fy2026.csv", actualText));
  const plan = parseCsv("plan-fy2026.csv", planText);
  return { ...actual, rows: [...actual.rows, ...planRows(plan)], rejected: [...actual.rejected, ...plan.rejected] };
}

export const actualRows = (table: Table): Row[] => table.rows.filter((row) => row["entry"] !== "planned");
export const plannedRows = (table: Table): Row[] => table.rows.filter((row) => row["entry"] === "planned");
export const sumAmount = (rows: readonly Row[]): number =>
  rows.reduce((sum, row) => sum + (typeof row["amount"] === "number" ? row["amount"] : 0), 0);
export const expensesOf = (rows: readonly Row[]): number =>
  sumAmount(rows.filter((row) => Number(row["amount"] ?? 0) < 0)) * -1;
export const incomeOf = (rows: readonly Row[]): number =>
  sumAmount(rows.filter((row) => Number(row["amount"] ?? 0) > 0));

export interface CategoryTotal {
  readonly category: string;
  readonly actual: number;
  readonly planned: number;
}

/** Spending and plan per category, for the bubbles and the plan bars. */
export function byCategory(table: Table): CategoryTotal[] {
  const actual = new Map<string, number>();
  const planned = new Map<string, number>();
  for (const row of actualRows(table)) {
    const key = String(row["category"] ?? "Other");
    const amount = Number(row["amount"] ?? 0);
    actual.set(key, (actual.get(key) ?? 0) + (amount < 0 ? -amount : 0));
  }
  for (const row of plannedRows(table)) {
    const key = String(row["category"] ?? "Other");
    planned.set(key, (planned.get(key) ?? 0) + Number(row["amount"] ?? 0));
  }
  return CATEGORIES.map((category) => ({
    category, actual: actual.get(category) ?? 0, planned: planned.get(category) ?? 0,
  })).filter((entry) => entry.actual > 0 || entry.planned > 0);
}
