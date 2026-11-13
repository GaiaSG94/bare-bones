export interface ParsedNumber {
  readonly value: number;
  readonly decimals: number;
}

export type DecimalSeparator = "," | ".";

const CURRENCY = /[\u20ac\u00a3\u0024\u00a5]/g;
const SPACES = /[\u0020\u00a0\u202f\u2009]/g;

export function normalizeNumberText(raw: string): string {
  return raw.replace(CURRENCY, "").replace(SPACES, "").trim();
}

function stripSign(body: string): { digits: string; negative: boolean } {
  if (body.startsWith("-")) return { digits: body.slice(1), negative: true };
  if (body.startsWith("+")) return { digits: body.slice(1), negative: false };
  return { digits: body, negative: false };
}

function build(integer: string, decimals: string, negative: boolean): ParsedNumber | null {
  if (integer === "" && decimals === "") return null;
  const value = Number(`${integer || "0"}.${decimals || "0"}`);
  if (!Number.isFinite(value)) return null;
  return { value: negative ? -value : value, decimals: decimals.length };
}

/**
 * Parses spreadsheet-style numbers.
 *
 * - both separators present ("1,240.00", "1.240,00"): the rightmost one is
 *   the decimal separator, the other groups thousands;
 * - one separator repeated ("1.234.567"): it groups thousands;
 * - one separator alone: three trailing digits are thousands, one or two
 *   are decimals.
 */
export function parseNumber(raw: string): ParsedNumber | null {
  const text = normalizeNumberText(raw);
  if (text === "" || text === "-" || text === "\u2013") return null;

  const negative = /^\(.*\)$/.test(text);
  const body = negative ? text.slice(1, -1) : text;
  if (!/^[+-]?[\d.,]+$/.test(body)) return null;

  const { digits, negative: signed } = stripSign(body);
  if (digits === "") return null;

  const commas = (digits.match(/,/g) ?? []).length;
  const dots = (digits.match(/\./g) ?? []).length;
  const isNegative = negative || signed;

  if (commas > 0 && dots > 0) {
    const decimalSeparator: DecimalSeparator =
      digits.lastIndexOf(",") > digits.lastIndexOf(".") ? "," : ".";
    const parts = digits.split(decimalSeparator);
    const decimals = parts.pop() ?? "";
    const integer = parts.join("").replace(/[.,]/g, "");
    return build(integer, decimals, isNegative);
  }

  if (commas > 1 || dots > 1) {
    return build(digits.replace(/[.,]/g, ""), "", isNegative);
  }

  if (commas === 1 || dots === 1) {
    const separator: DecimalSeparator = commas === 1 ? "," : ".";
    const [integer, decimals = ""] = digits.split(separator);
    if ((decimals ?? "").length === 3) {
      return build(`${integer ?? ""}${decimals}`, "", isNegative);
    }
    return build(integer ?? "", decimals, isNegative);
  }

  return build(digits, "", isNegative);
}

/**
 * Picks the decimal separator used by a column, from values that carry
 * exactly one separator followed by one or two digits.
 */
export function detectDecimalSeparator(samples: readonly string[]): DecimalSeparator {
  let commas = 0;
  let dots = 0;
  for (const sample of samples) {
    const text = normalizeNumberText(sample);
    if (/^[+-]?\d+,\d{1,2}$/.test(text)) commas += 1;
    if (/^[+-]?\d+\.\d{1,2}$/.test(text)) dots += 1;
  }
  return dots > commas ? "." : ",";
}
