# core-query — Requirements (EARS)

## 1. Filters

**Requirement 1.1** — The system shall support three filter kinds: range
(numeric bounds), multi-select (set of values) and text (substring).

**Requirement 1.2** — When a filter is applied, the system shall keep only
the rows that satisfy every active filter.

**Requirement 1.3** — Applying the same filters twice shall produce the same
row set as applying them once.

## 2. Sorting

**Requirement 2.1** — The system shall sort rows by one column, ascending
or descending.

**Requirement 2.2** — When two rows share the sorted value, the system shall
keep their original relative order (stable sort).

## 3. Aggregation

**Requirement 3.1** — The system shall group rows by one or more columns
and compute count, sum, mean, min and max measures.

**Requirement 3.2** — When a measure has no numeric value in a group, the
system shall report zero rather than `NaN`.

## 4. View state

**Requirement 4.1** — The `ViewState` shall fully determine what the
explorer displays: table, query, active view and options.

**Requirement 4.2** — Two view states that are deep-equal shall produce the
same rendered view.
