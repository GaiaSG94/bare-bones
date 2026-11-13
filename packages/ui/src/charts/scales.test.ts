import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { binValues, formatNumber, pointsToText } from "./points.js";
import { extent, scaleLinear, ticks } from "./scales.js";

const SEED = 20261111;

describe("scales", () => {
  it("maps the domain onto the range", () => {
    const scale = scaleLinear([0, 10], [0, 100]);
    expect(scale(0)).toBe(0);
    expect(scale(10)).toBe(100);
    expect(scale(5)).toBe(50);
  });

  it("never leaves the range for values inside the domain", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        (a, b, value) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          if (min === max) return;
          const scale = scaleLinear([min, max], [0, 200]);
          const result = scale(Math.min(Math.max(value, min), max));
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(200);
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("produces ticks inside the domain", () => {
    const values = ticks([0, 100], 4);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("computes the extent of a series", () => {
    expect(extent([3, 1, 8])).toEqual([1, 8]);
    expect(extent([])).toEqual([0, 0]);
  });
});

describe("points", () => {
  it("bins every value exactly once", () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: -100, max: 100, noNaN: true }), { maxLength: 60 }),
        (values) => {
          const bins = binValues(values, 6);
          const total = bins.reduce((sum, bin) => sum + bin.count, 0);
          expect(total).toBe(values.length);
        },
      ),
      { seed: SEED, numRuns: 100 },
    );
  });

  it("describes points as text", () => {
    expect(pointsToText([{ label: "Grants", value: 1200 }])).toContain("Grants: 1,200");
    expect(pointsToText([])).toBe("No data.");
  });

  it("formats big numbers compactly", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(12.345)).toBe("12.35");
  });
});
