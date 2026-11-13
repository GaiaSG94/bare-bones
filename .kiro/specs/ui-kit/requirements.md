# ui-kit — Requirements (EARS)

## 1. React kit

**Requirement 1.1** — The kit shall render an explorer from an
`ExplorerConfig` alone, without any business logic of its own.

**Requirement 1.2** — The kit shall expose components only through the
package root; apps shall never import an internal module path.

## 2. Grid

**Requirement 2.1** — The grid shall render only the rows inside the
viewport (plus an overscan), so a 50 000-row table stays responsive.

**Requirement 2.2** — The grid shall display typed values: dates as
`YYYY-MM-DD`, numbers with the decimals of their column.

## 3. Filters

**Requirement 3.1** — The filter panel shall offer one control per filter
kind: range, multi-select and text.

**Requirement 3.2** — Filters shall live in the view state, so a shared
link restores the same selection.

## 4. Charts

**Requirement 4.1** — The kit shall provide seven chart kinds as
hand-written SVG: bar, line, area, distribution, form, delta-bar and
bubble.

**Requirement 4.2** — Every chart shall expose a text equivalent
describing its values, and shall be marked `role="img"` with an
`aria-label`.

**Requirement 4.3** — The bubble chart shall size bubbles by area, so a
twice larger value reads as twice the area.

## 5. Theme

**Requirement 5.1** — Colors, fonts, radii and spacing shall come from
the app config as CSS custom properties.

**Requirement 5.2** — No component shall hardcode a color, a font or a
radius.

## 6. Sharing

**Requirement 6.1** — The share panel shall offer a public and a private
mode, and copy the link to the clipboard.

**Requirement 6.2** — When a link cannot be read, the explorer shall show
a fallback message instead of a broken view.

## 7. Safety

**Requirement 7.1** — The kit shall never use `dangerouslySetInnerHTML`.
