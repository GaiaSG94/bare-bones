export interface ChartPoint {
  readonly label: string;
  readonly value: number;
  readonly series?: string | undefined;
  readonly plan?: number | undefined;
}

export interface Bin {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly count: number;
}

export function maxAbs(points: readonly ChartPoint[]): number {
  return points.reduce((max, p) => Math.max(max, Math.abs(p.value)), 0);
}

export function groupBySeries(points: readonly ChartPoint[]): Map<string, ChartPoint[]> {
  const groups = new Map<string, ChartPoint[]>();
  for (const point of points) {
    const key = point.series ?? "";
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [point]);
    else group.push(point);
  }
  return groups;
}

/** Even-width histogram bins over the given values. */
export function binValues(
  values: readonly number[],
  binCount = 8,
): readonly Bin[] {
  if (values.length === 0) return [];
  let min = values[0] ?? 0;
  let max = values[0] ?? 0;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === max) {
    return [{ label: `${min}`, from: min, to: max, count: values.length }];
  }
  const width = (max - min) / binCount;
  const bins: Bin[] = [];
  for (let index = 0; index < binCount; index += 1) {
    const from = min + width * index;
    const to = index === binCount - 1 ? max : min + width * (index + 1);
    const count = values.filter((value) =>
      index === binCount - 1 ? value >= from && value <= to : value >= from && value < to,
    ).length;
    bins.push({ label: formatNumber(from), from, to, count });
  }
  return bins;
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return String(Number(value.toFixed(2)));
}

export function pointsToText(points: readonly ChartPoint[]): string {
  if (points.length === 0) return "No data.";
  return points
    .map((p) => `${p.label}: ${formatNumber(p.value)}${p.plan === undefined ? "" : ` (plan ${formatNumber(p.plan)})`}`)
    .join("; ");
}
