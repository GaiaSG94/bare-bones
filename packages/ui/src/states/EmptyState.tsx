import type { ReactNode } from "react";

export interface ExpectedColumn {
  readonly label: string;
  readonly hint?: string | undefined;
}

export interface EmptyStateProps {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly description: string;
  readonly columns?: readonly ExpectedColumn[];
  readonly note?: string | undefined;
  readonly zoneLabel?: string;
  readonly zoneHint?: string | undefined;
  readonly demoTitle?: string | undefined;
  readonly demoNote?: string | undefined;
  readonly demoLabel?: string | undefined;
  readonly art?: ReactNode | undefined;
  readonly accept?: string;
  readonly onFile: (file: File) => void;
  readonly onDemo?: (() => void) | undefined;
}

/** State A: first visit, nothing loaded yet. */
export function EmptyState({
  eyebrow,
  title,
  description,
  columns = [],
  note,
  zoneLabel = "Drop a .csv file here",
  zoneHint,
  demoTitle,
  demoNote,
  demoLabel = "Load demo data",
  art,
  accept = ".csv,text/csv",
  onFile,
  onDemo,
}: EmptyStateProps) {
  return (
    <div className="bb-empty">
      <div className="bb-empty-l">
        <span className="bb-cap">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <label className="bb-zone">
          <span className="bb-zone-ic" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>
          </span>
          <span className="bb-zone-t">
            {zoneLabel}
            {zoneHint === undefined ? null : <span>{zoneHint}</span>}
          </span>
          <span className="bb-zone-btn">Choose a file</span>
          <input type="file" accept={accept} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file !== undefined) onFile(file);
          }} />
        </label>
        {columns.length === 0 ? null : (
          <div className="bb-empty-cols">
            {columns.map((column) => (
              <span key={column.label}>
                {column.label}
                {column.hint === undefined ? null : <i>{column.hint}</i>}
              </span>
            ))}
          </div>
        )}
        {note === undefined ? null : (
          <div className="bb-safe"><i />{note}</div>
        )}
      </div>
      <div className="bb-empty-r">
        {art}
        {demoTitle === undefined ? null : (
          <div className="bb-demo-card">
            <div className="t">
              {demoTitle}
              {demoNote === undefined ? null : <span>{demoNote}</span>}
            </div>
            <button type="button" onClick={onDemo}>{demoLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
