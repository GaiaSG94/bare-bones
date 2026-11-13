import type { Table } from "../types.js";

export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function tableToCsv(table: Table): string {
  const header = table.columns.map((column) => escapeCsvField(column.label));
  const lines = table.rows.map((row) =>
    table.columns
      .map((column) => escapeCsvField(cellToText(row[column.id])))
      .join(","),
  );
  return [header.join(","), ...lines].join("\r\n");
}
