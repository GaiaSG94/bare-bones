import type { ChartKind } from "@bare-bones/core";
import type { ChartPoint } from "./points.js";
import { BarChart } from "./BarChart.js";
import { LineChart } from "./LineChart.js";
import { DistributionChart } from "./DistributionChart.js";
import { FormChart } from "./FormChart.js";
import { DeltaBarChart } from "./DeltaBarChart.js";
import { BubbleChart } from "./BubbleChart.js";

export interface ChartProps {
  readonly kind: ChartKind;
  readonly title: string;
  readonly points: readonly ChartPoint[];
  readonly values?: readonly number[] | undefined;
  readonly results?: readonly ("win" | "draw" | "loss")[] | undefined;
  readonly width?: number | undefined | undefined;
  readonly height?: number | undefined | undefined;
}

/** Dispatches a chart kind to its renderer. One entry point for views. */
export function Chart({
  kind,
  title,
  points,
  values = [],
  results = [],
  width,
  height,
}: ChartProps) {
  switch (kind) {
    case "bar":
      return <BarChart title={title} points={points} width={width} height={height} />;
    case "line":
      return <LineChart title={title} points={points} width={width} height={height} />;
    case "area":
      return (
        <LineChart title={title} points={points} width={width} height={height} filled />
      );
    case "distribution":
      return (
        <DistributionChart title={title} values={values} width={width} height={height} />
      );
    case "form":
      return (
        <FormChart title={title} results={results} width={width} height={height} />
      );
    case "delta-bar":
      return (
        <DeltaBarChart title={title} points={points} width={width} height={height} />
      );
    case "bubble":
      return (
        <BubbleChart title={title} points={points} width={width} height={height} />
      );
  }
}
