/**
 * Public API of @bare-bones/ui. Frozen contract: see docs/CONTRACTS.md.
 * Apps import from the package root only.
 */

export { ThemeProvider, useBbTheme } from "./theme/ThemeProvider.js";
export { DEFAULT_THEME, themeToCssVars } from "./theme/tokens.js";

export { PageShell } from "./layout/PageShell.js";
export { Sidebar } from "./layout/Sidebar.js";

export { VirtualGrid } from "./grid/VirtualGrid.js";
export { computeWindow } from "./grid/virtual.js";

export { FilterPanel } from "./filters/FilterPanel.js";

export { Chart } from "./charts/Chart.js";
export { ChartFrame } from "./charts/ChartFrame.js";
export { BarChart } from "./charts/BarChart.js";
export { LineChart } from "./charts/LineChart.js";
export { DistributionChart } from "./charts/DistributionChart.js";
export { FormChart } from "./charts/FormChart.js";
export { DeltaBarChart } from "./charts/DeltaBarChart.js";
export { BubbleChart } from "./charts/BubbleChart.js";
export { binValues, formatNumber, pointsToText } from "./charts/points.js";
export { extent, paddedExtent, scaleLinear, ticks } from "./charts/scales.js";

export { ShareCard } from "./share/ShareCard.js";
export { useHashToken, useShareLink } from "./share/useShareLink.js";

export { Explorer } from "./explorer/Explorer.js";
export { DropZone } from "./explorer/DropZone.js";
export { MetricCards } from "./explorer/MetricCards.js";
export { RejectedRows } from "./explorer/RejectedRows.js";
export { buildChartData } from "./explorer/chartData.js";
export { useExplorer } from "./explorer/useExplorer.js";

export type { ExplorerProps } from "./explorer/Explorer.js";
export type { GridProps } from "./grid/VirtualGrid.js";
export type { FilterPanelProps } from "./filters/FilterPanel.js";
export type { ChartProps } from "./charts/Chart.js";
export type { ShareCardProps } from "./share/ShareCard.js";
export type { ThemeContextValue } from "./theme/ThemeProvider.js";
export type { ChartPoint, Bin } from "./charts/points.js";
