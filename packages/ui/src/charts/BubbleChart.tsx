import type { ChartPoint } from "./points.js";
import { formatNumber, pointsToText } from "./points.js";
import { ChartFrame } from "./ChartFrame.js";

export interface BubbleChartProps {
  readonly title: string;
  readonly points: readonly ChartPoint[];
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
}

function bubbleRadius(value: number, maxValue: number, maxSize: number): number {
  if (maxValue <= 0) return maxSize / 3;
  const ratio = Math.max(0, value) / maxValue;
  return 6 + Math.sqrt(ratio) * (maxSize / 2 - 6);
}

/**
 * Proportional bubbles ("where the money went"): area proportional to
 * the value, bubbles laid out on a single row.
 */
export function BubbleChart({
  title,
  points,
  width = 640,
  height = 240,
}: BubbleChartProps) {
  const maxSize = Math.min(height - 40, ((width - 20) / Math.max(1, points.length)) * 1.6);
  const maxValue = points.reduce((max, p) => Math.max(max, Math.abs(p.value)), 0);
  const radii = points.map((p) => bubbleRadius(p.value, maxValue, maxSize));
  const total = radii.reduce((sum, r) => sum + r * 2 + 8, 0);

  let cursor = Math.max(0, (width - total) / 2);
  const positions = radii.map((radius) => {
    const x = cursor + radius;
    cursor += radius * 2 + 8;
    return x;
  });

  return (
    <ChartFrame
      title={title}
      textAlternative={`Proportional bubbles. ${pointsToText(points)}`}
      width={width}
      height={height}
    >
      {points.map((point, index) => {
        const radius = radii[index] ?? 0;
        const cx = positions[index] ?? width / 2;
        const cy = (height - 30) / 2 + 8;
        return (
          <g key={point.label}>
            <circle cx={cx} cy={cy} r={radius} fill="var(--bb-color-accent)" opacity={0.75}>
              <title>{`${point.label}: ${formatNumber(point.value)}`}</title>
            </circle>
            <text
              x={cx}
              y={height - 16}
              fontSize={10}
              textAnchor="middle"
              fill="var(--bb-color-ink)"
            >
              {point.label.length > 10 ? `${point.label.slice(0, 9)}.` : point.label}
            </text>
            <text
              x={cx}
              y={height - 4}
              fontSize={10}
              textAnchor="middle"
              fill="var(--bb-color-muted)"
            >
              {formatNumber(point.value)}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}
