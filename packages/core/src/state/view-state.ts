import type { Query, ViewState } from "../types.js";

export function emptyQuery(): Query {
  return { filters: [], sort: null, aggregation: null };
}

export function createViewState(
  tableId: string,
  viewId: string,
  overrides: Partial<Omit<ViewState, "tableId" | "viewId">> = {},
): ViewState {
  return {
    tableId,
    viewId,
    query: overrides.query ?? emptyQuery(),
    options: overrides.options ?? {},
  };
}

export function withFilters(state: ViewState, filters: Query["filters"]): ViewState {
  return { ...state, query: { ...state.query, filters } };
}

export function withSort(state: ViewState, sort: Query["sort"]): ViewState {
  return { ...state, query: { ...state.query, sort } };
}

export function viewStatesEqual(left: ViewState, right: ViewState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
