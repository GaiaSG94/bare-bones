import type { ImportOutcome } from "../types.js";
import { decodeText } from "./encoding.js";
import { detectDelimiter, splitCsv } from "./csv.js";
import { buildTable } from "./table.js";

export interface ParseOptions {
  readonly name: string;
}

export interface ParseResult extends ImportOutcome {
  readonly encoding: "utf-8" | "windows-1252";
  readonly delimiter: string;
}

export function parseCsvText(text: string, options: ParseOptions): ParseResult {
  const delimiter = detectDelimiter(text);
  const records = splitCsv(text, delimiter);
  const headerRecord = records[0];
  if (headerRecord === undefined) {
    return {
      table: {
        id: "empty",
        name: options.name,
        columns: [],
        rows: [],
        rejected: [],
      },
      warnings: ["The file has no readable header row."],
      encoding: "utf-8",
      delimiter,
    };
  }

  const header = headerRecord.cells.map((cell, index) =>
    cell.trim() === "" ? `Column ${index + 1}` : cell.trim(),
  );
  const body = records.slice(1).map((record) => record.cells);
  const { table } = buildTable({
    name: options.name,
    header,
    body,
    firstDataLine: 2,
  });

  const warnings: string[] = [];
  if (table.rejected.length > 0) {
    warnings.push(`${table.rejected.length} row(s) could not be read and were rejected.`);
  }
  if (table.rows.length === 0) {
    warnings.push("No usable rows were found in this file.");
  }
  return { table, warnings, encoding: "utf-8", delimiter };
}

/**
 * Full import pipeline: bytes to typed table, with encoding detection.
 */
export function importBytes(
  bytes: ArrayBuffer | Uint8Array,
  options: ParseOptions,
): ParseResult {
  const decoded = decodeText(bytes);
  const result = parseCsvText(decoded.text, options);
  return { ...result, encoding: decoded.encoding };
}
