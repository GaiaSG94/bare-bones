import { extent, scaleLinear, ticks } from "./scales.js";
import type { ChartPoint } from "./points.js";
import { formatNumber, pointsToText } from "./points.js";
import { ChartFrame } from "./ChartFrame.js";

export interface BarChartProps {
  readonly title: string;
  readonly points: readonly ChartPoint[];
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
  readonly unit?: string | undefined | undefined;
}

/**
 * Vertical bars, one per label. Values may be negative (bars grow down
 * from the zero line).
 */
export function BarChart({
  title,
  points,
  width = 640,
  height = 240,
  unit = "",
}: BarChartProps) {
  const pad = { top: 16, right: 12, bottom: 28, left: 44 };
  const values = points.map((p) => p.value);
  const [min, max] = extent([0, ...values]);
  const scaleY = scaleLinear(
    [min, max],
    [height - pad.bottom, pad.top],
  );
  const plotWidth = width - pad.left - pad.right;
  const slot = points.length === 0 ? plotWidth : plotWidth / points.length;
  const barWidth = Math.max(2, slot * 0.6);
  const zeroY = scaleY(0);

  return (
    <ChartFrame title={title} textAlternative={describe(points, unit)} width={width} height={height}>
      {ticks([min, max], 4).map((tick) => (
        <g key={tick}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={scaleY(tick)}
            y2={scaleY(tick)}
            stroke="var(--bb-color-line)"
            strokeWidth={1}
          />
          <text x={4} y={scaleY(tick) + 4} fontSize={10} fill="var(--bb-color-muted)">
            {formatNumber(tick)}
          </text>
        </g>
      ))}
      {points.map((point, index) => {
        const x = pad.left + slot * index + (slot - barWidth) / 2;
        const y = Math.min(zeroY, scaleY(point.value));
        const barHeight = Math.abs(zeroY - scaleY(point.value));
        return (
          <g key={point.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={3}
              fill={point.value < 0 ? "var(--bb-color-bad)" : "var(--bb-color-accent)"}
            />
            <text
              x={x + barWidth / 2}
              y={height - 8}
              fontSize={10}
              textAnchor="middle"
              fill="var(--bb-color-muted)"
            >
              {point.label.length > 8 ? `${point.label.slice(0, 7)}.` : point.label}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

function describe(points: readonly ChartPoint[], unit: string): string {
  return `Bar chart. ${pointsToText(points)}${unit === "" ? "" : ` ${unit}`}`;
}
