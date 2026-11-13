# core-types — Tasks

- [ ] Create `packages/core/src/types.ts` with `ColumnType`, `Column`,
      `CellValue`, `Table`, `RejectedRow`, `BareBonesError`.
- [ ] Add `Query` (filters, sort, grouping) and `ViewState`.
- [ ] Add the five extension interfaces: `Importer`, `Derivation`,
      `Reducer`, `ViewSpec`, `ShareAdapter`.
- [ ] Add `ExplorerConfig` (five registries + theme + i18n declarations).
- [ ] Colocate Zod schemas for boundary payloads
      (`packages/core/src/schema.ts`).
- [ ] Pin the public API in `docs/CONTRACTS.md` and freeze it.
- [ ] Type-level tests (`expectTypeOf`) for every exported type.
- [ ] Property test: `ViewState` deep-equality ⇒ identical rendering input
      (serialization round-trip), seed `20261111`.
- [ ] Wire the "public API only" guard so apps cannot deep-import core
      internals.
