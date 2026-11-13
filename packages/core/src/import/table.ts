import type {
  CellValue,
  Column,
  ColumnType,
  RejectedRow,
  Table,
} from "../types.js";
import { detectDatePattern, parseDate } from "./dates.js";
import { detectDecimalSeparator, parseNumber } from "./values.js";

const CATEGORY_MAX = 24;
const CATEGORY_MAX_LENGTH = 60;

export function slugify(label: string, index: number): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base === "" ? `column-${index}` : base;
}

function uniqueIds(labels: readonly string[]): string[] {
  const seen = new Set<string>();
  return labels.map((label, index) => {
    const base = slugify(label, index);
    let id = base;
    let suffix = 2;
    while (seen.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    seen.add(id);
    return id;
  });
}

function majority<T>(
  samples: readonly string[],
  matches: (value: string) => boolean,
): boolean {
  if (samples.length === 0) return false;
  const hits = samples.filter(matches).length;
  return hits > samples.length / 2;
}

function inferColumnType(values: readonly string[]): ColumnType {
  const samples = values.map((v) => v.trim()).filter((v) => v !== "");
  if (samples.length === 0) return "text";
  if (majority(samples, (s) => parseNumber(s) !== null)) return "number";
  if (majority(samples, (s) => parseDate(s) !== null)) return "date";
  const distinct = new Set(samples);
  if (
    distinct.size <= CATEGORY_MAX &&
    distinct.size <= Math.max(3, Math.floor(values.length / 2)) &&
    samples.every((s) => s.length <= CATEGORY_MAX_LENGTH)
  ) {
    return "category";
  }
  return "text";
}

function maxDecimals(samples: readonly string[]): number {
  let max = 0;
  for (const sample of samples) {
    const parsed = parseNumber(sample);
    if (parsed !== null) max = Math.max(max, parsed.decimals);
  }
  return max;
}

function finalizeColumn(
  column: Column,
  type: ColumnType,
  samples: readonly string[],
): Column {
  if (type === "number") {
    const locale = detectDecimalSeparator(samples);
    return {
      ...column,
      type,
      format: {
        kind: "number",
        decimals: maxDecimals(samples),
        locale: locale === "," ? "fr" : "en",
      },
    };
  }
  if (type === "date") {
    const pattern = detectDatePattern(samples);
    return {
      ...column,
      type,
      format: { kind: "date", pattern: pattern ?? "dd/mm/yyyy" },
    };
  }
  if (type === "category") {
    const levels = [
      ...new Set(samples.map((s) => s.trim()).filter((s) => s !== "")),
    ];
    return { ...column, type, format: { kind: "category", levels } };
  }
  return { ...column, type, format: { kind: "text" } };
}

export interface BuildOptions {
  readonly name: string;
  readonly header: readonly string[];
  readonly body: readonly (readonly string[])[];
  readonly firstDataLine?: number;
}

export interface BuildResult {
  readonly table: Table;
  readonly rejected: readonly RejectedRow[];
}

type ConversionFailure = "invalid-date" | "invalid-number";

function convert(
  raw: string,
  column: Column,
): { ok: true; value: CellValue } | { ok: false; reason: ConversionFailure } {
  const text = raw.trim();
  if (text === "") return { ok: true, value: null };
  if (column.type === "number") {
    const parsed = parseNumber(text);
    if (parsed === null) return { ok: false, reason: "invalid-number" };
    return { ok: true, value: parsed.value };
  }
  if (column.type === "date") {
    const pattern = column.format.kind === "date" ? column.format.pattern : undefined;
    const parsed = parseDate(text, pattern) ?? parseDate(text);
    if (parsed === null) return { ok: false, reason: "invalid-date" };
    return { ok: true, value: parsed.value };
  }
  return { ok: true, value: text };
}

/**
 * Builds a typed table from raw CSV cells. Rows that cannot be converted
 * are rejected and kept with their reason; they never reach the UI as
 * silent blanks.
 */
export function buildTable(options: BuildOptions): BuildResult {
  const { header, body } = options;
  const ids = uniqueIds(header);
  const rawColumns: Column[] = header.map((label, index) => ({
    id: ids[index] ?? `column-${index}`,
    label,
    type: "text" as ColumnType,
    format: { kind: "text" as const },
  }));

  const columns = rawColumns.map((column, index) => {
    const samples = body.map((row) => row[index] ?? "");
    const type = inferColumnType(samples);
    return finalizeColumn(column, type, samples);
  });

  const rows: Record<string, CellValue>[] = [];
  const rejected: RejectedRow[] = [];
  const firstDataLine = options.firstDataLine ?? 2;

  body.forEach((cells, index) => {
    const line = firstDataLine + index;
    if (cells.length !== columns.length) {
      rejected.push({
        line,
        raw: cells.join(";"),
        reason: "column-count",
        detail: `expected ${columns.length} columns, got ${cells.length}`,
      });
      return;
    }
    const row: Record<string, CellValue> = {};
    for (const [column, cellIndex] of columns.map((c, i) => [c, i] as const)) {
      const outcome = convert(cells[cellIndex] ?? "", column);
      if (!outcome.ok) {
        rejected.push({
          line,
          raw: cells.join(";"),
          reason: outcome.reason,
          detail: `${column.label}: ${cells[cellIndex] ?? ""}`,
        });
        return;
      }
      row[column.id] = outcome.value;
    }
    rows.push(row);
  });

  const table: Table = {
    id: slugify(options.name, 0) || "table",
    name: options.name,
    columns,
    rows,
    rejected,
  };
  return { table, rejected };
}
