import type { ImportOutcome } from "@bare-bones/core";
import { ImportProgress } from "./ImportProgress.js";
import type { ImportStep } from "./ImportProgress.js";
import { ImportResult } from "./ImportResult.js";

export interface ImportScreenProps {
  readonly fileName: string;
  readonly fileSize: number;
  readonly totalRows: number;
  readonly header: readonly string[];
  readonly phase: string;
  readonly error: string | null;
  readonly outcome: ImportOutcome | null;
  readonly onCancel: () => void;
  readonly onOpen: () => void;
  readonly openLabel?: string;
}

function sizeLabel(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * State B: the file bar, the three real worker steps, then the result
 * card with kept / set-aside counters and the rejected-rows download.
 */
export function ImportScreen({
  fileName,
  fileSize,
  totalRows,
  header,
  phase,
  error,
  outcome,
  onCancel,
  onOpen,
  openLabel = "Open the explorer",
}: ImportScreenProps) {
  const rank = phase === "columns" ? 0 : phase === "rows" ? 1 : 2;
  const done = outcome !== null;
  const stepState = (index: number): ImportStep["state"] => (done || index < rank ? "ok" : index === rank ? "now" : "wait");
  const steps: readonly ImportStep[] = [
    { id: "columns", label: "Columns recognised", detail: header.join(" · "), state: stepState(0) },
    { id: "rows", label: "Checking every row", detail: "in a background worker", state: stepState(1) },
    { id: "building", label: "Building the explorer", detail: "", state: stepState(2) },
  ];
  return (
    <div className="bb-screen">
      <div className="bb-screen-bar">
        <span className="bb-screen-title">
          {fileName}
          <small>{sizeLabel(fileSize)}</small>
        </span>
        <span className="bb-screen-spacer" />
        <button type="button" className="bb-screen-ghost" onClick={onCancel}>Cancel</button>
      </div>
      <div className="bb-screen-body">
        {error !== null ? (
          <p className="bb-import-error" role="alert">{error}</p>
        ) : (
          <ImportProgress
            title="Reading your spreadsheet…"
            counter={`${totalRows.toLocaleString("en-US")} rows`}
            progress={done ? 1 : (rank + 1) / 3}
            steps={steps}
          />
        )}
        {outcome === null ? null : (
          <ImportResult
            kept={outcome.table.rows.length}
            rejected={outcome.table.rejected}
            columns={outcome.table.columns}
            openLabel={openLabel}
            onOpen={onOpen}
          />
        )}
      </div>
    </div>
  );
}
