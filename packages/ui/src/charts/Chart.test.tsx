import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Chart } from "./Chart.js";
import type { ChartKind } from "@bare-bones/core";

const KINDS: readonly ChartKind[] = [
  "bar",
  "line",
  "area",
  "distribution",
  "form",
  "delta-bar",
  "bubble",
];

const points = [
  { label: "Grants", value: 1200 },
  { label: "Membership", value: 640 },
  { label: "Activities", value: 310 },
];

describe("Chart", () => {
  it("renders every kind with an accessible text equivalent", () => {
    for (const kind of KINDS) {
      const html = renderToString(
        <Chart
          kind={kind}
          title={`${kind} title`}
          points={points}
          values={[1, 2, 3, 4, 5, 6, 7, 8]}
          results={["win", "draw", "loss"]}
        />,
      );
      expect(html).toContain('role="img"');
      expect(html).toContain("Text version");
      expect(html).toContain(`${kind} title`);
    }
  });

  it("spells out the values in the text version", () => {
    const html = renderToString(
      <Chart kind="bar" title="Budget" points={points} />,
    );
    expect(html).toContain("Grants: 1,200");
  });

  it("renders an empty chart without crashing", () => {
    const html = renderToString(<Chart kind="bar" title="Empty" points={[]} />);
    expect(html).toContain("No data.");
  });
});
