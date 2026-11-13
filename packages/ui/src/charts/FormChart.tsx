import type { ChartPoint } from "./points.js";
import { ChartFrame } from "./ChartFrame.js";

export interface FormChartProps {
  readonly title: string;
  readonly results: readonly ("win" | "draw" | "loss")[];
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
}

/**
 * Form pills (recent W/D/L streak). The text equivalent spells the
 * streak out so screen readers get the same information.
 */
export function FormChart({
  title,
  results,
  width = 640,
  height = 64,
}: FormChartProps) {
  const diameter = Math.min(28, height - 24);
  const slot = results.length === 0 ? 0 : width / results.length;
  const colors = {
    win: "var(--bb-color-good)",
    draw: "var(--bb-color-neutral)",
    loss: "var(--bb-color-bad)",
  } as const;
  const letters = { win: "W", draw: "D", loss: "L" } as const;

  return (
    <ChartFrame
      title={title}
      textAlternative={`Form (oldest to latest): ${results.map((r) => letters[r]).join(", ") || "no matches"}`}
      width={width}
      height={height}
    >
      {results.map((result, index) => (
        <circle
          key={index}
          cx={slot * index + slot / 2}
          cy={height / 2}
          r={diameter / 2}
          fill={colors[result]}
        >
          <title>{letters[result]}</title>
        </circle>
      ))}
      {results.map((result, index) => (
        <text
          key={`label-${index}`}
          x={slot * index + slot / 2}
          y={height / 2 + 4}
          fontSize={12}
          textAnchor="middle"
          fill="#fff"
        >
          {letters[result]}
        </text>
      ))}
    </ChartFrame>
  );
}
