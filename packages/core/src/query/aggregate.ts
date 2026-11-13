import type {
  AggregationSpec,
  Column,
  Measure,
  Metric,
  Row,
  Table,
} from "../types.js";
import { selectRows } from "./rows.js";

export interface AggregateGroup {
  readonly key: string;
  readonly label: string;
  readonly values: Readonly<Record<string, number>>;
  readonly count: number;
}

function numericValues(rows: readonly Row[], columnId: string | null): number[] {
  if (columnId === null) return [];
  const values: number[] = [];
  for (const row of rows) {
    const value = row[columnId];
    if (typeof value === "number") values.push(value);
    else if (value instanceof Date) values.push(value.getTime());
  }
  return values;
}

function computeMeasure(measure: Measure, rows: readonly Row[]): number {
  switch (measure.kind) {
    case "count":
      return rows.length;
    case "sum":
      return numericValues(rows, measure.columnId).reduce((sum, v) => sum + v, 0);
    case "mean": {
      const values = numericValues(rows, measure.columnId);
      if (values.length === 0) return 0;
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    case "min": {
      const values = numericValues(rows, measure.columnId);
      return values.length === 0 ? 0 : Math.min(...values);
    }
    case "max": {
      const values = numericValues(rows, measure.columnId);
      return values.length === 0 ? 0 : Math.max(...values);
    }
  }
}

function groupKey(row: Row, groupBy: readonly string[]): string {
  return groupBy.map((columnId) => String(row[columnId] ?? "")).join(" · ");
}

function groupLabel(row: Row, groupBy: readonly string[], columns: readonly Column[]): string {
  if (groupBy.length === 0) return "All";
  return groupBy
    .map((columnId) => {
      const column = columns.find((c) => c.id === columnId);
      const label = column?.label ?? columnId;
      return `${label}: ${String(row[columnId] ?? "")}`;
    })
    .join(" · ");
}

export function aggregate(
  table: Table,
  spec: AggregationSpec,
): readonly AggregateGroup[] {
  const rows = selectRows(table, {
    filters: [],
    sort: null,
    aggregation: null,
  });

  const groups = new Map<string, { row: Row; rows: Row[] }>();
  for (const row of rows) {
    const key = groupKey(row, spec.groupBy);
    const existing = groups.get(key);
    if (existing === undefined) {
      groups.set(key, { row, rows: [row] });
    } else {
      existing.rows.push(row);
    }
  }

  return [...groups.entries()].map(([key, group]) => {
    const values: Record<string, number> = {};
    for (const measure of spec.measures) {
      values[measure.as] = computeMeasure(measure, group.rows);
    }
    return {
      key,
      label: groupLabel(group.row, spec.groupBy, table.columns),
      values,
      count: group.rows.length,
    };
  });
}

export function aggregateToMetrics(
  table: Table,
  spec: AggregationSpec,
): readonly Metric[] {
  const groups = aggregate(table, spec);
  return groups.map((group) => ({
    id: group.key,
    label: group.label,
    value: group.count,
    unit: null,
    detail: null,
  }));
}
