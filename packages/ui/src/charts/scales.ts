export interface ScaleLinear {
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  (value: number): number;
}

export function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
): ScaleLinear {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  const scale = (value: number) => {
    if (span === 0) return (r0 + r1) / 2;
    return r0 + ((value - d0) / span) * (r1 - r0);
  };
  return Object.assign(scale, { domain, range });
}

export function extent(values: readonly number[]): readonly [number, number] {
  if (values.length === 0) return [0, 0];
  let min = values[0] ?? 0;
  let max = values[0] ?? 0;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
}

/** Pads a domain so bars and bubbles never touch the frame. */
export function paddedExtent(
  values: readonly number[],
  ratio = 0.05,
): readonly [number, number] {
  const [min, max] = extent(values);
  const pad = Math.max(Math.abs(max - min) * ratio, 1e-9);
  return [min - pad, max + pad];
}

export function ticks(domain: readonly [number, number], count: number): number[] {
  const [min, max] = domain;
  if (min === max) return [min];
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(raw) || 1));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? magnitude;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 0.001; value += step) {
    out.push(Number(value.toFixed(10)));
  }
  return out;
}
