# core-import — Tasks

- [x] `src/import/encoding.ts` — strict UTF-8 then windows-1252, BOM strip.
- [x] `src/import/csv.ts` — separator detection, quoted-field scanner.
- [x] `src/import/values.ts` — number parsing for `1 240,00` and `1,240.00`.
- [x] `src/import/dates.ts` — `dd/mm/yyyy`, `yyyy-mm-dd`, `dd-mm-yyyy`.
- [x] `src/import/table.ts` — type inference, conversion, rejected rows.
- [x] `src/import/pipeline.ts` — bytes → text → records → typed table.
- [x] `src/import/worker.ts` — worker message handler, DOM-free.
- [x] Property tests with seed `20261111` for bytes, numbers, dates, cells.
- [ ] Wire the worker into the UI drop zone (step 3).
