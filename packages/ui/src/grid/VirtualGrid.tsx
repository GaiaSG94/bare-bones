import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Column, Row } from "@bare-bones/core";
import { computeWindow } from "./virtual.js";

export interface GridProps {
  readonly columns: readonly Column[];
  readonly rows: readonly Row[];
  readonly rowHeight?: number | undefined;
  readonly height?: number | undefined;
  readonly caption?: string | undefined;
  /** Optional cell renderer: apps use it to draw their own chips and badges. */
  readonly renderCell?: ((column: Column, row: Row) => ReactNode) | undefined;
}

function formatCell(value: unknown, column: Column): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && column.format.kind === "number") {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: column.format.decimals,
      maximumFractionDigits: column.format.decimals,
    });
  }
  return String(value);
}

/**
 * Virtualized table. Only the visible rows are in the DOM; the maths
 * lives in `virtual.ts` so it stays testable without a browser.
 */
export function VirtualGrid({
  columns,
  rows,
  rowHeight = 34,
  height = 420,
  caption,
  renderCell,
}: GridProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const view = useMemo(
    () =>
      computeWindow({
        rowCount: rows.length,
        rowHeight,
        viewportHeight: height,
        scrollTop,
      }),
    [rows.length, rowHeight, height, scrollTop],
  );

  const visible = rows.slice(view.startIndex, view.endIndex);

  return (
    <div
      className="bb-grid"
      style={{ maxHeight: height, overflowY: "auto" }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: view.topPadding }} aria-hidden="true" />
      <table>
        {caption === undefined ? null : <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col">
                {column.label}
                <small>{column.type}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, offset) => (
            <tr key={view.startIndex + offset}>
              {columns.map((column) => (
                <td key={column.id}>
                  {renderCell === undefined
                    ? formatCell(row[column.id], column)
                    : renderCell(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ height: view.bottomPadding }} aria-hidden="true" />
      <span hidden>{rows.length} rows</span>
    </div>
  );
}
