import type { Filter, Query, Row, SortSpec, Table } from "../types.js";

function cellAsNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function cellAsText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function matchesRange(row: Row, filter: Extract<Filter, { kind: "range" }>): boolean {
  const value = cellAsNumber(row[filter.columnId]);
  if (value === null) return false;
  if (filter.min !== null && value < filter.min) return false;
  if (filter.max !== null && value > filter.max) return false;
  return true;
}

function matchesMultiSelect(
  row: Row,
  filter: Extract<Filter, { kind: "multi-select" }>,
): boolean {
  if (filter.values.length === 0) return false;
  return filter.values.includes(cellAsText(row[filter.columnId]));
}

function matchesText(row: Row, filter: Extract<Filter, { kind: "text" }>): boolean {
  const term = filter.caseSensitive ? filter.term : filter.term.toLowerCase();
  if (term === "") return true;
  const value = cellAsText(row[filter.columnId]);
  const haystack = filter.caseSensitive ? value : value.toLowerCase();
  return haystack.includes(term);
}

export function matchesFilter(row: Row, filter: Filter): boolean {
  switch (filter.kind) {
    case "range":
      return matchesRange(row, filter);
    case "multi-select":
      return matchesMultiSelect(row, filter);
    case "text":
      return matchesText(row, filter);
  }
}

export function applyFilters(table: Table, filters: readonly Filter[]): Row[] {
  if (filters.length === 0) return [...table.rows];
  return table.rows.filter((row) => filters.every((filter) => matchesFilter(row, filter)));
}

function compareValues(left: unknown, right: unknown): number {
  const leftNumber = cellAsNumber(left);
  const rightNumber = cellAsNumber(right);
  if (leftNumber !== null && rightNumber !== null) return leftNumber - rightNumber;
  return cellAsText(left).localeCompare(cellAsText(right));
}

/**
 * Stable sort: equal keys keep their original order (Array.prototype.sort
 * is stable in modern engines, but the tie-break is explicit here).
 */
export function sortRows(rows: readonly Row[], sort: SortSpec | null): Row[] {
  if (sort === null) return [...rows];
  const factor = sort.direction === "desc" ? -1 : 1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const comparison = compareValues(a.row[sort.columnId], b.row[sort.columnId]);
      if (comparison !== 0) return comparison * factor;
      return a.index - b.index;
    })
    .map((entry) => entry.row);
}

export function selectRows(table: Table, query: Query): Row[] {
  return sortRows(applyFilters(table, query.filters), query.sort);
}
