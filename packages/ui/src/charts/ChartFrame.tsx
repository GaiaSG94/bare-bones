import type { ReactNode } from "react";

export interface ChartFrameProps {
  readonly title: string;
  readonly textAlternative: string;
  readonly width: number;
  readonly height: number;
  readonly children: ReactNode;
}

/**
 * Wraps every chart: one `<figure>` with `role="img"`, an aria-label and
 * a visible-on-demand text equivalent. The accessibility rule lives
 * here so no chart can forget it.
 */
export function ChartFrame({
  title,
  textAlternative,
  width,
  height,
  children,
}: ChartFrameProps) {
  return (
    <figure className="bb-chart" role="img" aria-label={`${title}. ${textAlternative}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ display: "block" }}
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
      <figcaption>
        <details>
          <summary>Text version</summary>
          <p>{textAlternative}</p>
        </details>
      </figcaption>
    </figure>
  );
}
