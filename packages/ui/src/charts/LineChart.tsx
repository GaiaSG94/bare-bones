import { groupBySeries, type ChartPoint } from "./points.js";
import { formatNumber, pointsToText } from "./points.js";
import { extent, scaleLinear, ticks } from "./scales.js";
import { ChartFrame } from "./ChartFrame.js";

export interface LineChartProps {
  readonly title: string;
  readonly points: readonly ChartPoint[];
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
  readonly filled?: boolean | undefined | undefined;
}

/**
 * Line chart over ordered labels; `filled` renders it as an area chart.
 * Multiple series each get their own polyline.
 */
export function LineChart({
  title,
  points,
  width = 640,
  height = 240,
  filled = false,
}: LineChartProps) {
  const pad = { top: 16, right: 12, bottom: 28, left: 44 };
  const values = points.map((p) => p.value);
  const [min, max] = extent([0, ...values]);
  const scaleY = scaleLinear([min, max], [height - pad.bottom, pad.top]);
  const groups = [...groupBySeries(points).entries()];
  const slot =
    points.length <= 1
      ? 0
      : (width - pad.left - pad.right) / Math.max(1, points.length - 1);

  const describe = () =>
    `${filled ? "Area" : "Line"} chart. ${pointsToText(points)}`;

  return (
    <ChartFrame title={title} textAlternative={describe()} width={width} height={height}>
      {ticks([min, max], 4).map((tick) => (
        <g key={tick}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={scaleY(tick)}
            y2={scaleY(tick)}
            stroke="var(--bb-color-line)"
          />
          <text x={4} y={scaleY(tick) + 4} fontSize={10} fill="var(--bb-color-muted)">
            {formatNumber(tick)}
          </text>
        </g>
      ))}
      {groups.map(([series, group], groupIndex) => {
        const coords = group.map((point, index) => ({
          x: pad.left + slot * index,
          y: scaleY(point.value),
        }));
        const path = coords.map((c) => `${c.x},${c.y}`).join(" ");
        const baseline = height - pad.bottom;
        const palette = ["var(--bb-color-accent)", "var(--bb-color-good)", "var(--bb-color-bad)"];
        const color = palette[groupIndex % palette.length];
        return (
          <g key={series === "" ? "series" : series}>
            {filled ? (
              <polygon
                points={`${pad.left},${baseline} ${path} ${coords[coords.length - 1]?.x ?? pad.left},${baseline}`}
                fill={color}
                opacity={0.15}
              />
            ) : null}
            <polyline
              points={path}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {coords.map((c, index) => (
              <circle key={index} cx={c.x} cy={c.y} r={2.5} fill={color} />
            ))}
          </g>
        );
      })}
      {points.map((point, index) =>
        index % Math.ceil(points.length / 8 || 1) === 0 ? (
          <text
            key={point.label + index}
            x={pad.left + slot * index}
            y={height - 8}
            fontSize={10}
            textAnchor="middle"
            fill="var(--bb-color-muted)"
          >
            {point.label}
          </text>
        ) : null,
      )}
    </ChartFrame>
  );
}
