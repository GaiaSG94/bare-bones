import { binValues, type Bin } from "./points.js";
import { scaleLinear } from "./scales.js";
import { ChartFrame } from "./ChartFrame.js";

export interface DistributionChartProps {
  readonly title: string;
  readonly values: readonly number[];
  readonly bins?: number | undefined | undefined;
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
}

/** Histogram of a numeric column. */
export function DistributionChart({
  title,
  values,
  bins = 8,
  width = 640,
  height = 240,
}: DistributionChartProps) {
  const pad = { top: 16, right: 12, bottom: 28, left: 44 };
  const histogram = binValues(values, bins);
  const maxCount = histogram.reduce((max, bin) => Math.max(max, bin.count), 0);
  const scaleY = scaleLinear(
    [0, maxCount],
    [height - pad.bottom, pad.top],
  );
  const plotWidth = width - pad.left - pad.right;
  const slot = histogram.length === 0 ? plotWidth : plotWidth / histogram.length;
  const barWidth = Math.max(2, slot * 0.9);

  const text = histogram
    .map((bin) => `${bin.label}\u2013${formatBin(bin)}: ${bin.count}`)
    .join("; ");

  return (
    <ChartFrame
      title={title}
      textAlternative={`Distribution. ${text === "" ? "No data." : text}`}
      width={width}
      height={height}
    >
      {histogram.map((bin, index) => {
        const x = pad.left + slot * index + (slot - barWidth) / 2;
        const y = scaleY(bin.count);
        return (
          <g key={`${bin.from}-${bin.to}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(height - pad.bottom - y, 1)}
              rx={3}
              fill="var(--bb-color-accent)"
            />
            <text
              x={x + barWidth / 2}
              y={height - 8}
              fontSize={10}
              textAnchor="middle"
              fill="var(--bb-color-muted)"
            >
              {bin.label}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

function formatBin(bin: Bin): string {
  return bin.to === bin.from ? bin.label : String(Number(bin.to.toFixed(2)));
}
