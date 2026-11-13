import type { ChartSpec, Table } from "@bare-bones/core";
import { aggregate } from "@bare-bones/core";
import type { ChartPoint } from "../charts/points.js";

export interface ChartData {
  readonly points: readonly ChartPoint[];
  readonly values: readonly number[];
  readonly results: readonly ("win" | "draw" | "loss")[];
}

const WIN = ["w", "win", "won", "v", "victoire"];
const DRAW = ["d", "draw", "drawn", "n", "nul"];
const LOSS = ["l", "loss", "lost", "d", "defaite"];

function toResult(value: unknown): "win" | "draw" | "loss" | null {
  const text = String(value ?? "").trim().toLowerCase();
  if (WIN.includes(text)) return "win";
  if (DRAW.includes(text)) return "draw";
  if (LOSS.includes(text)) return "loss";
  return null;
}

/**
 * Turns a table and a chart spec into chart-ready points. Generic on
 * purpose: apps never compute chart data themselves.
 */
export function buildChartData(table: Table | null, spec: ChartSpec | null): ChartData {
  if (table === null || spec === null) {
    return { points: [], values: [], results: [] };
  }
  if (spec.kind === "form") {
    const column = table.columns.find((c) => c.id === spec.x);
    const results = table.rows
      .map((row) => toResult(row[spec.x ?? ""]))
      .filter((result): result is "win" | "draw" | "loss" => result !== null);
    return { points: [], values: [], results };
  }
  if (spec.kind === "distribution") {
    const column = table.columns.find((c) => c.id === spec.y);
    const values = table.rows
      .map((row) => row[spec.y ?? ""])
      .filter((value): value is number => typeof value === "number");
    return { points: [], values: column === undefined ? values : values, results: [] };
  }
  const groups = aggregate(table, {
    groupBy: spec.x === null ? [] : [spec.x],
    measures: [
      { kind: "sum", columnId: spec.y, as: spec.y ?? "value" },
    ],
  });
  const points: ChartPoint[] = groups.map((group) => ({
    label: group.label,
    value: group.values[spec.y ?? "value"] ?? 0,
  }));
  return { points, values: points.map((point) => point.value), results: [] };
}
