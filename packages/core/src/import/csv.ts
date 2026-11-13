export type Delimiter = "," | ";" | "\t";

export interface CsvRecord {
  readonly cells: readonly string[];
  readonly raw: string;
}

export function detectDelimiter(text: string): Delimiter {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts: Record<Delimiter, number> = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (const char of firstLine) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && char in counts) counts[char as Delimiter] += 1;
  }
  if (counts[";"] > counts[","] && counts[";"] >= counts["\t"]) return ";";
  if (counts["\t"] > counts[";"] && counts["\t"] >= counts[","]) return "\t";
  return ",";
}

function unquote(field: string): string {
  if (!field.startsWith('"')) return field;
  const inner = field.slice(1, field.endsWith('"') ? -1 : undefined);
  return inner.replace(/""/g, '"');
}

/**
 * Splits CSV text into records, honouring quoted fields (including
 * embedded delimiters and newlines).
 */
export function splitCsv(text: string, delimiter: Delimiter): CsvRecord[] {
  const records: CsvRecord[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let lineStart = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i] ?? "";
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"' && field === "") {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      cells.push(field);
      records.push({ cells, raw: text.slice(lineStart, i).trim() });
      cells = [];
      field = "";
      lineStart = i + 1;
    } else {
      field += char;
    }
  }

  if (field !== "" || cells.length > 0) {
    cells.push(field);
    records.push({ cells, raw: text.slice(lineStart).trim() });
  }
  return records.filter((record) => record.cells.some((cell) => cell.trim() !== ""));
}
