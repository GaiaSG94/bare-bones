# ui-kit — Design

## Context

`packages/ui` is a React kit, not an application. It renders what the
`ExplorerConfig` describes and owns no domain rule: a category is a
category because the app's derivation says so.

## Decisions

1. **Config-driven, not prop-driven.** One `<Explorer config={...} />` is
   the entry point. Apps ship a config file, not a component tree.
2. **Theme as CSS custom properties.** `themeToCssVars` maps the
   declarative tokens to `--bb-color-*`, `--bb-font-*`, `--bb-radius-*`.
   The base stylesheet only ever references those variables, so Orb and
   Floodlight can be completely different on the same code.
3. **One accessibility gate.** Every chart goes through `ChartFrame`,
   which adds `role="img"`, an `aria-label` and a visible text
   equivalent. A chart cannot forget it because the frame owns it.
4. **Virtualization maths in a pure module.** `computeWindow` has no DOM
   dependency and is property-tested (paddings consistent with the row
   range, window always covers the viewport).
5. **Charts take points, not tables.** The kit receives `ChartPoint[]`
   (label, value, optional plan). The generic `buildChartData` helper
   turns a table into points using the core query engine, so apps never
   compute chart data themselves.
6. **State lives in the URL.** `useExplorer` restores the view from the
   fragment and writes filters back to the view state; nothing is stored
   in localStorage.

## Testing

- Property tests: window maths, scale clamping, histogram binning.
- Render tests with `react-dom/server`: every chart kind exposes its text
  equivalent; the explorer renders the drop zone, then views, metrics,
  chart, share panel and rejected rows.
