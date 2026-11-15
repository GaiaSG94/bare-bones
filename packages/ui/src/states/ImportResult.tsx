import type { Column, RejectedRow } from "@bare-bones/core";
import { REJECT_LABELS, downloadText, faultyIndices, rawCells, rejectedCsv } from "./importMachine.js";

function rawDelimiter(raw: string): string {
  const count = (char: string): number => raw.split(char).length - 1;
  if (count(";") >= count(",") && count(";") >= count("\t")) return ";";
  if (count("\t") > count(";")) return "\t";
  return ",";
}

/** One rejected raw row, with the faulty cells highlighted. */
function RejectedLine({ row, columns }: { row: RejectedRow; columns: readonly Column[] }) {
  const cells = rawCells(row.raw);
  const faulty = new Set(faultyIndices(row.raw, row.reason, columns) ?? cells.map((_, index) => index));
  const delimiter = rawDelimiter(row.raw);
  return (
    <div className="bb-rejected-line">
      <span className="bb-rejected-n">row {row.line.toLocaleString("en-US")}</span>
      <code>
        {cells.map((cell, index) => (
          <span key={index}>
            {index === 0 ? null : delimiter}
            {faulty.has(index) ? <u>{cell}</u> : cell}
          </span>
        ))}
      </code>
      <b>{REJECT_LABELS[row.reason]}</b>
    </div>
  );
}

export interface ImportResultProps {
  readonly kept: number;
  readonly rejected: readonly RejectedRow[];
  readonly columns: readonly Column[];
  readonly openLabel?: string;
  readonly downloadLabel?: string;
  readonly downloadName?: string;
  readonly onOpen: () => void;
}

/** Result card: real kept / set-aside counters, rejected rows, CSV download. */
export function ImportResult({
  kept,
  rejected,
  columns,
  openLabel = "Open the explorer",
  downloadLabel = "Download rejected rows",
  downloadName = "rejected-rows.csv",
  onOpen,
}: ImportResultProps) {
  return (
    <section className="bb-import-result" aria-label="Import result">
      <div className="bb-import-result-top">
        <b>
          Ready. {kept.toLocaleString("en-US")} row{kept === 1 ? "" : "s"} in your explorer.
        </b>
        <span className="bb-pill ok">{kept.toLocaleString("en-US")} kept</span>
        <span className={`bb-pill ${rejected.length === 0 ? "ok" : "no"}`}>
          {rejected.length.toLocaleString("en-US")} set aside
        </span>
      </div>
      {rejected.length === 0 ? (
        <p className="bb-import-clean">Every row was read. Nothing was set aside.</p>
      ) : (
        <div className="bb-rejected-list">
          {rejected.map((row) => (
            <RejectedLine key={row.line} row={row} columns={columns} />
          ))}
        </div>
      )}
      <div className="bb-import-actions">
        <button type="button" className="bb-import-open" onClick={onOpen}>
          {openLabel}
        </button>
        {rejected.length === 0 ? null : (
          <button
            type="button"
            className="bb-import-download"
            onClick={() => downloadText(downloadName, rejectedCsv(rejected))}
          >
            {downloadLabel}
          </button>
        )}
      </div>
    </section>
  );
}
