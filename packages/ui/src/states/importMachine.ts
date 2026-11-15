import type { Column, RejectedRow, RejectionReason } from "@bare-bones/core";
import { detectDelimiter, escapeCsvField, splitCsv } from "@bare-bones/core";

export type Delimiter = "," | ";" | "\t";

/** Real counter: data rows below the header (empty lines excluded). */
export function countRows(text: string): number {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  return Math.max(0, lines.length - 1);
}

/** Header labels of the first CSV line. */
export function headerOf(text: string): readonly string[] {
  const first = text.split(/\r?\n/)[0] ?? "";
  return splitCsv(first, detectDelimiter(first))[0]?.cells ?? [];
}

/** Cells of one raw (rejected) row. */
export function rawCells(raw: string): readonly string[] {
  const source = raw.trim() === "" ? "," : raw;
  const cells = splitCsv(source, detectDelimiter(source))[0]?.cells;
  if (cells !== undefined && cells.length > 0) return cells;
  return raw.split(detectDelimiter(raw || ","));
}

/**
 * Indices of the faulty cells, derived from the reason and the columns.
 * Structural failures (empty line, wrong column count, unparseable row)
 * return null: the whole raw row is at fault.
 */
export function faultyIndices(
  raw: string,
  reason: RejectionReason,
  columns: readonly Column[],
): readonly number[] | null {
  if (reason !== "invalid-date" && reason !== "invalid-number") return null;
  const wanted = reason === "invalid-date" ? "date" : "number";
  return columns
    .map((column, index) => (column.type === wanted ? index : -1))
    .filter((index) => index >= 0);
}

export const REJECT_LABELS: Record<RejectionReason, string> = {
  "invalid-date": "Date does not exist",
  "invalid-number": "Amount is not a number",
  "empty-line": "Empty row, skipped",
  "column-count": "Wrong number of columns",
  unparseable: "Could not parse row",
};

/** CSV export of the rejected rows (the "Download rejected rows" file). */
export function rejectedCsv(rejected: readonly RejectedRow[]): string {
  const rows = rejected.map((row) =>
    [String(row.line), row.reason, REJECT_LABELS[row.reason], row.raw]
      .map(escapeCsvField)
      .join(","),
  );
  return ["line,reason,why,raw", ...rows].join("\r\n");
}

export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
