import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { computeWindow } from "./virtual.js";

const SEED = 20261111;

describe("computeWindow", () => {
  it("renders a window that covers the viewport", () => {
    const view = computeWindow({
      rowCount: 1000,
      rowHeight: 34,
      viewportHeight: 400,
      scrollTop: 3400,
    });
    expect(view.startIndex).toBeLessThanOrEqual(100);
    expect(view.endIndex).toBeGreaterThan(100);
    expect(view.topPadding + (view.endIndex - view.startIndex) * 34).toBeGreaterThan(3400);
  });

  it("keeps the paddings consistent with the row range", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        (rowCount, scrollTop, rowHeight) => {
          const view = computeWindow({
            rowCount,
            rowHeight,
            viewportHeight: 400,
            scrollTop,
          });
          expect(view.startIndex).toBeGreaterThanOrEqual(0);
          expect(view.endIndex).toBeLessThanOrEqual(rowCount);
          expect(view.endIndex).toBeGreaterThanOrEqual(view.startIndex);
          expect(view.topPadding).toBe(view.startIndex * rowHeight);
          expect(view.bottomPadding).toBe((rowCount - view.endIndex) * rowHeight);
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });

  it("returns an empty window for an empty table", () => {
    expect(
      computeWindow({ rowCount: 0, rowHeight: 34, viewportHeight: 400, scrollTop: 0 }),
    ).toEqual({ startIndex: 0, endIndex: 0, topPadding: 0, bottomPadding: 0 });
  });
});
