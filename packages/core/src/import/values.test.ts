import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { detectDecimalSeparator, parseNumber } from "./values.js";

const SEED = 20261111;

describe("parseNumber", () => {
  it("reads French thousands and decimals", () => {
    expect(parseNumber("1 240,00")).toEqual({ value: 1240, decimals: 2 });
    expect(parseNumber("1 240")).toEqual({ value: 1240, decimals: 0 });
    expect(parseNumber("-12,5")).toEqual({ value: -12.5, decimals: 1 });
  });

  it("reads English thousands and decimals", () => {
    expect(parseNumber("1,240.00")).toEqual({ value: 1240, decimals: 2 });
    expect(parseNumber("1,240")).toEqual({ value: 1240, decimals: 0 });
    expect(parseNumber("(42.50)")).toEqual({ value: -42.5, decimals: 2 });
  });

  it("reads currency and plain integers", () => {
    expect(parseNumber("€1 240,00")).toEqual({ value: 1240, decimals: 2 });
    expect(parseNumber("42")).toEqual({ value: 42, decimals: 0 });
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("-")).toBeNull();
    expect(parseNumber("n/a")).toBeNull();
  });

  it("round-trips generated integers", () => {
    fc.assert(
      fc.property(fc.integer({ min: -1_000_000, max: 1_000_000 }), (value) => {
        const parsed = parseNumber(String(value));
        expect(parsed?.value).toBe(value);
      }),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("round-trips generated decimals written in French style", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100_000, max: 100_000 }),
        fc.integer({ min: 0, max: 99 }),
        (units, cents) => {
          const absolute = Math.abs(units) + cents / 100;
          const sign = units < 0 ? -1 : 1;
          const text = `${units.toLocaleString("fr-FR").replace(/\u202f/g, " ")},${String(cents).padStart(2, "0")}`;
          const parsed = parseNumber(text);
          expect(parsed?.value).toBeCloseTo(sign * absolute, 10);
          expect(parsed?.decimals).toBe(2);
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("detects the decimal separator of a column", () => {
    expect(detectDecimalSeparator(["1,5", "2,75"])).toBe(",");
    expect(detectDecimalSeparator(["1.5", "2.75"])).toBe(".");
  });
});
