# core-types — Requirements (EARS)

## 1. Type spine

**Requirement 1.1** — The system shall define `ColumnType` as exactly one of
`date`, `text`, `category`, `number`, `outcome`.

**Requirement 1.2** — The system shall define a `Column` type carrying a
stable `id`, a display `label`, a `ColumnType`, and a per-type format
descriptor.

**Requirement 1.3** — The system shall define a `Table` type composed of a
stable `id`, a `name`, an ordered list of `Column`s, and row values
referenced by column `id`.

**Requirement 1.4** — When a row value does not conform to its column type,
the system shall represent it as `null` and never throw at read time.

## 2. Query and view state

**Requirement 2.1** — The system shall define a `Query` type covering
filters (range, multi-select, text), sorting, and aggregation grouping.

**Requirement 2.2** — The system shall define a `ViewState` type that fully
determines what the explorer shows: source reference, `Query`, active view
id, and view options.

**Requirement 2.3** — When two `ViewState` values are deep-equal, the
rendered explorer shall be identical.

## 3. Errors

**Requirement 3.1** — The system shall define a `BareBonesError` type with a
machine-readable `code` and a human-readable `message`.

**Requirement 3.2** — When data is rejected during import, the system shall
keep the row and a rejection reason in a typed structure (`RejectedRow`).

## 4. Extension points

**Requirement 4.1** — The system shall define exactly five extension
interfaces: `Importer`, `Derivation`, `Reducer`, `ViewSpec`, `ShareAdapter`.

**Requirement 4.2** — The system shall define an `ExplorerConfig` type
aggregating the five registries plus theme and i18n declarations.

**Requirement 4.3** — When an app registers extension implementations, the
system shall require them to satisfy the frozen interfaces without any
modification of `core` or `ui`.

## 5. Freeze

**Requirement 5.1** — When the public API of `core` is published, the system
shall keep it source-compatible for the rest of the project (frozen
contract in `docs/CONTRACTS.md`).

**Requirement 5.2** — The system shall validate persisted or shared
payloads with Zod schemas derived from these types.
