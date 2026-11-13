# core-import — Design

## Context

`packages/core/src/import/` turns a spreadsheet export into a typed
`Table`. It runs in a Web Worker so a 50 000-row file does not freeze the
UI. It never touches the DOM.

## Decisions

1. **Byte level first.** `decodeText` tries strict UTF-8 (fatal decoder) and
   falls back to windows-1252. A BOM is stripped whatever the encoding.
2. **One scanner, two layers.** `splitCsv` is a character scanner (quoted
   fields, escaped quotes, embedded newlines) that returns records;
   `buildTable` turns records into typed rows. Separating them keeps the
   scanner testable on its own.
3. **Two-pass typing.** Columns are typed from all their raw values first,
   then each row is converted. A row that fails conversion is rejected with
   its reason instead of being silently blanked.
4. **Majority inference.** A column is `number` or `date` when more than
   half of its non-empty values parse as such; otherwise it is `category`
   (few distinct short values) or `text`.
5. **Numbers are locale-tolerant.** `parseNumber` treats the rightmost
   separator as the decimal one when both are present, groups thousands
   when a separator repeats, and reads `1 240,00` and `1,240.00` alike.
6. **Dates are validated, not just formatted.** `31/02/2026` is rejected:
   the calendar date is rebuilt in UTC and compared field by field.

## Testing

- Property tests (fast-check, seed `20261111`): byte round-trip, number
  round-trip in French and English styles, date round-trip, CSV cell
  round-trip.
- Example tests: separator detection, quoted separators and newlines,
  rejected rows with their reason.
