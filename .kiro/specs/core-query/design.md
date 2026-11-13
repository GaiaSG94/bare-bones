# core-query — Design

## Context

`packages/core/src/query/` selects the rows a view displays and computes
the aggregates a chart or metric card needs. It is pure: filters and sorts
return new arrays, the input table is never mutated.

## Decisions

1. **Selection composes one way.** `selectRows = sortRows ∘ applyFilters`.
   Filters are conjunctive; a view that needs OR semantics registers its
   own derivation instead.
2. **Explicit tie-break for stability.** Rows are sorted through an
   (row, index) pair so equal keys keep their input order even where the
   platform sort is stable anyway; the property test pins it.
3. **Comparisons are number-first.** Dates compare by timestamp, text by
   locale-aware comparison; `null` never matches a range.
4. **Aggregation returns groups, not charts.** `aggregate` returns
   `{ key, label, values, count }` groups; chart kinds live in `ViewSpec`
   so the same aggregate feeds a bar chart or a bubble map.
5. **ViewState is plain data.** It must survive a JSON round-trip through
   the share link unchanged.

## Testing

Property tests (seed `20261111`): filter idempotence, stable sort, view
state JSON round-trip. Example tests: filter behaviour per kind, aggregate
measures including empty groups.
