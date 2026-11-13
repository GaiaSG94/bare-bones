export interface VirtualWindow {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly topPadding: number;
  readonly bottomPadding: number;
}

export interface VirtualOptions {
  readonly rowCount: number;
  readonly rowHeight: number;
  readonly viewportHeight: number;
  readonly scrollTop: number;
  readonly overscan?: number | undefined;
}

/**
 * Computes which rows to render for a virtualized grid. The maths is
 * pure so it can be property-tested without a DOM.
 */
export function computeWindow(options: VirtualOptions): VirtualWindow {
  const { rowCount, rowHeight, viewportHeight, scrollTop } = options;
  const overscan = options.overscan ?? 4;
  if (rowCount === 0 || rowHeight <= 0 || viewportHeight <= 0) {
    return { startIndex: 0, endIndex: 0, topPadding: 0, bottomPadding: 0 };
  }
  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const maxFirst = Math.max(0, rowCount - visibleCount);
  const firstVisible = Math.min(maxFirst, Math.floor(Math.max(0, scrollTop) / rowHeight));
  const startIndex = Math.min(rowCount, Math.max(0, firstVisible - overscan));
  const endIndex = Math.min(rowCount, Math.max(startIndex, firstVisible + visibleCount + overscan));
  return {
    startIndex,
    endIndex,
    topPadding: startIndex * rowHeight,
    bottomPadding: Math.max(0, (rowCount - endIndex) * rowHeight),
  };
}
