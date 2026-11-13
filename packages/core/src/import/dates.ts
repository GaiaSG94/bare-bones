import type { DatePattern } from "../types.js";

export interface ParsedDate {
  readonly value: Date;
  readonly pattern: DatePattern;
}

export const DATE_PATTERNS: readonly DatePattern[] = [
  "yyyy-mm-dd",
  "dd/mm/yyyy",
  "dd-mm-yyyy",
];

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function build(
  year: number,
  month: number,
  day: number,
  pattern: DatePattern,
): ParsedDate | null {
  if (!isValidDate(year, month, day)) return null;
  return { value: new Date(Date.UTC(year, month - 1, day)), pattern };
}

/**
 * Parses dd/mm/yyyy, yyyy-mm-dd and dd-mm-yyyy. Returns null for
 * impossible dates (31/02, 32/01, month 13).
 */
export function parseDate(raw: string, pattern?: DatePattern): ParsedDate | null {
  const text = raw.trim();
  if (text === "") return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) {
    if (pattern && pattern !== "yyyy-mm-dd") return null;
    return build(Number(iso[1]), Number(iso[2]), Number(iso[3]), "yyyy-mm-dd");
  }

  const slashed = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (slashed) {
    if (pattern && pattern !== "dd/mm/yyyy") return null;
    return build(
      Number(slashed[3]),
      Number(slashed[2]),
      Number(slashed[1]),
      "dd/mm/yyyy",
    );
  }

  const dashed = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(text);
  if (dashed) {
    if (pattern && pattern !== "dd-mm-yyyy") return null;
    return build(
      Number(dashed[3]),
      Number(dashed[2]),
      Number(dashed[1]),
      "dd-mm-yyyy",
    );
  }

  return null;
}

/**
 * Infers the date format of a column: the first pattern that accepts every
 * non-empty value wins. Ambiguous values (01/02/2024) resolve to
 * dd/mm/yyyy, the documented default.
 */
export function detectDatePattern(values: readonly string[]): DatePattern | null {
  const samples = values.filter((v) => v.trim() !== "");
  if (samples.length === 0) return null;
  for (const pattern of DATE_PATTERNS) {
    if (samples.every((value) => parseDate(value, pattern) !== null)) {
      return pattern;
    }
  }
  return null;
}
