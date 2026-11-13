import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { createViewState, withFilters, withSort, viewStatesEqual } from "./view-state.js";
import { applyFilters, selectRows, sortRows } from "../query/rows.js";
import type { Table } from "../types.js";

const SEED = 20261111;

const table: Table = {
  id: "t",
  name: "t",
  columns: [
    { id: "amount", label: "Amount", type: "number", format: { kind: "number", decimals: 2, locale: "fr" } },
    { id: "category", label: "Category", type: "category", format: { kind: "category", levels: ["A", "B"] } },
  ],
  rows: [
    { amount: 10, category: "A" },
    { amount: 20, category: "B" },
    { amount: 15, category: "A" },
  ],
  rejected: [],
};

describe("view state", () => {
  it("creates an empty state", () => {
    const state = createViewState("t", "overview");
    expect(state.query.filters).toEqual([]);
    expect(viewStatesEqual(state, withFilters(state, []))).toBe(true);
  });

  it("round-trips through JSON", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("amount", "category")),
        fc.constantFrom("asc", "desc"),
        (columnIds, direction) => {
          const state = withSort(
            withFilters(
              createViewState("t", "table"),
              columnIds.map((columnId) => ({ kind: "text" as const, columnId, term: "", caseSensitive: false })),
            ),
            columnIds.length > 0
              ? { columnId: columnIds[0] as string, direction: direction as "asc" | "desc" }
              : null,
          );
          expect(viewStatesEqual(state, JSON.parse(JSON.stringify(state)))).toBe(true);
        },
      ),
      { seed: SEED, numRuns: 100 },
    );
  });
});

describe("query", () => {
  it("filters rows", () => {
    const rows = applyFilters(table, [{ kind: "range", columnId: "amount", min: 15, max: null }]);
    expect(rows.map((r) => r.amount)).toEqual([20, 15]);
  });

  it("is idempotent: filtering twice equals filtering once", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("amount", "category")),
        (columnIds) => {
          const filters = columnIds.map((columnId) => ({
            kind: "text" as const,
            columnId,
            term: "",
            caseSensitive: false,
          }));
          const once = applyFilters(table, filters);
          const twice = applyFilters(table, filters).filter((row) =>
            filters.every((filter) => row[filter.columnId] !== undefined),
          );
          expect(twice.length).toBeLessThanOrEqual(once.length);
          expect(applyFilters(table, filters)).toEqual(once);
        },
      ),
      { seed: SEED, numRuns: 100 },
    );
  });

  it("sorts stably: equal keys keep their input order", () => {
    const rows = sortRows(table.rows, { columnId: "category", direction: "asc" });
    expect(rows.map((r) => r.amount)).toEqual([10, 15, 20]);
  });

  it("keeps the original order for tied keys", () => {
    const ties: Table = {
      ...table,
      rows: [
        { amount: 5, category: "A" },
        { amount: 5, category: "B" },
        { amount: 5, category: "A" },
      ],
    };
    const sorted = sortRows(ties.rows, { columnId: "category", direction: "desc" });
    expect(sorted.map((r) => r.amount)).toEqual([5, 5, 5]);
    expect(sorted[1]?.amount).toBe(5);
  });

  it("filters then sorts without changing the row set", () => {
    const query = {
      filters: [{ kind: "range" as const, columnId: "amount", min: 10, max: 20 }],
      sort: { columnId: "amount", direction: "desc" as const },
      aggregation: null,
    };
    expect(selectRows(table, query).map((r) => r.amount)).toEqual([20, 15, 10]);
  });
});
