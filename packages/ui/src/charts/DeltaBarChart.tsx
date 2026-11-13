import { extent, scaleLinear, ticks } from "./scales.js";
import type { ChartPoint } from "./points.js";
import { formatNumber, pointsToText } from "./points.js";
import { ChartFrame } from "./ChartFrame.js";

export interface DeltaBarChartProps {
  readonly title: string;
  readonly points: readonly ChartPoint[];
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
}

/**
 * Actual (solid bar) vs plan (dashed outline) per label. Used by the
 * budget app's "Actual vs plan" view.
 */
export function DeltaBarChart({
  title,
  points,
  width = 640,
  height = 240,
}: DeltaBarChartProps) {
  const pad = { top: 16, right: 12, bottom: 28, left: 44 };
  const values = points.flatMap((p) => [0, p.value, p.plan ?? 0]);
  const [min, max] = extent(values);
  const scaleY = scaleLinear([min, max], [height - pad.bottom, pad.top]);
  const plotWidth = width - pad.left - pad.right;
  const slot = points.length === 0 ? plotWidth : plotWidth / points.length;
  const barWidth = Math.max(2, slot * 0.55);
  const zeroY = scaleY(0);

  return (
    <ChartFrame
      title={title}
      textAlternative={`Actual vs plan. ${pointsToText(points)}`}
      width={width}
      height={height}
    >
      {ticks([min, max], 4).map((tick) => (
        <line
          key={tick}
          x1={pad.left}
          x2={width - pad.right}
          y1={scaleY(tick)}
          y2={scaleY(tick)}
          stroke="var(--bb-color-line)"
        />
      ))}
      {points.map((point, index) => {
        const x = pad.left + slot * index + (slot - barWidth) / 2;
        const y = Math.min(zeroY, scaleY(point.value));
        const barHeight = Math.abs(zeroY - scaleY(point.value));
        const planY = Math.min(zeroY, scaleY(point.plan ?? 0));
        const planHeight = Math.abs(zeroY - scaleY(point.plan ?? 0));
        return (
          <g key={point.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={3}
              fill={point.value < (point.plan ?? 0) ? "var(--bb-color-bad)" : "var(--bb-color-good)"}
            />
            <rect
              x={x - 2}
              y={planY}
              width={barWidth + 4}
              height={Math.max(planHeight, 1)}
              rx={4}
              fill="none"
              stroke="var(--bb-color-ink)"
              strokeDasharray="4 3"
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
      <text x={width - pad.right - 70} y={12} fontSize={10} fill="var(--bb-color-muted)">
        — — {formatNumber(points.length)} plan
      </text>
    </ChartFrame>
  );
}
