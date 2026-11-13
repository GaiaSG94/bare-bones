import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { detectDatePattern, parseDate } from "./dates.js";

const SEED = 20261111;

describe("parseDate", () => {
  it("reads the three supported patterns", () => {
    expect(parseDate("24/03/2026")?.value.toISOString().slice(0, 10)).toBe("2026-03-24");
    expect(parseDate("2026-03-24")?.value.toISOString().slice(0, 10)).toBe("2026-03-24");
    expect(parseDate("24-03-2026")?.value.toISOString().slice(0, 10)).toBe("2026-03-24");
  });

  it("rejects impossible dates", () => {
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("32/01/2026")).toBeNull();
    expect(parseDate("01/13/2026")).toBeNull();
    expect(parseDate("")).toBeNull();
    expect(parseDate("not a date")).toBeNull();
  });

  it("round-trips generated calendar dates", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2099 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        (year, month, day) => {
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const parsed = parseDate(iso);
          expect(parsed?.value.toISOString().slice(0, 10)).toBe(iso);
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("detects the pattern of a column", () => {
    expect(detectDatePattern(["01/02/2026", "03/04/2026"])).toBe("dd/mm/yyyy");
    expect(detectDatePattern(["2026-02-01", "2026-04-03"])).toBe("yyyy-mm-dd");
    expect(detectDatePattern(["01-02-2026", "03-04-2026"])).toBe("dd-mm-yyyy");
    expect(detectDatePattern(["nope", "03/04/2026"])).toBeNull();
  });
});
