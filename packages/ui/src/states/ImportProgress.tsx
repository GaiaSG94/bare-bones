export interface ImportStep {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly state: "ok" | "now" | "wait";
}

export interface ImportProgressProps {
  readonly title: string;
  readonly counter: string;
  readonly progress: number;
  readonly steps: readonly ImportStep[];
  readonly onCancel?: (() => void) | undefined;
}

const MARK: Record<ImportStep["state"], string> = { ok: "✓", now: "•", wait: "·" };

/** The three-step import card, driven by the real worker phases. */
export function ImportProgress({ title, counter, progress, steps, onCancel }: ImportProgressProps) {
  return (
    <section className="bb-import" aria-label="Import progress">
      <div className="bb-import-top">
        <b>{title}</b>
        <span className="bb-import-counter">{counter}</span>
        {onCancel === undefined ? null : (
          <button type="button" className="bb-import-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      <div
        className="bb-import-track"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <ol className="bb-import-steps">
        {steps.map((step) => (
          <li key={step.id} className={`bb-${step.state}`}>
            <i aria-hidden="true">{MARK[step.state]}</i>
            <span>
              {step.label}
              {step.detail === "" ? null : <small>{step.detail}</small>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
