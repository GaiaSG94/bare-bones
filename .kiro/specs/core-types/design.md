# core-types — Design

## Context

`packages/core/src/types.ts` is the frozen spine of the skeleton. Everything
else (query engine, share codec, UI kit, apps) is written against these
types. Breaking them means breaking every app, so the API is frozen once
published (see `docs/CONTRACTS.md`).

## Decisions

1. **Discriminated unions over optional soup.** Column format descriptors
   and filter payloads are discriminated unions on `type`/`kind`. This keeps
   `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` usable.

2. **Row values keyed by column id.** A row is a flat record
   `{ [columnId: string]: CellValue }` where `CellValue` is
   `string | number | boolean | Date | null`. No positional arrays: column
   reordering must not invalidate shared links.

3. **Extension points are interfaces, not base classes.** The five
   registries (`importers`, `derivations`, `reducers`, `views`,
   `shareAdapters`) are arrays of interface implementations declared in the
   app's `explorer.config.ts`. Core never imports app code.

4. **Zod beside the types.** Every type that crosses a trust boundary
   (share links, demo data files) has a colocated Zod schema. Runtime
   validation happens only at boundaries; internal code trusts the types.

5. **Errors as data.** `BareBonesError` and `RejectedRow` are values, so a
   broken row or a corrupted link flows through the same pipelines and can
   be rendered by any view.

## Risks / trade-offs

- `Date` in `CellValue` forces serialization care in the share codec; the
  codec spec will pin an ISO-string encoding inside the payload instead.
- Freezing the API early may force small additive changes later; only
  **additive** changes are allowed after freeze (no rename, no removal).

## Testing

- Type-level tests (`expectTypeOf`) pin the shape of every exported type.
- Property test: for any generated `Table`, a deep-equal `ViewState`
  round-trips through serialization without drift.
