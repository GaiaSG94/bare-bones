import { useMemo, useState } from "react";
import type { ExplorerConfig, ShareMode, Table } from "@bare-bones/core";
import { tableToCsv } from "@bare-bones/core";
import { ThemeProvider } from "../theme/ThemeProvider.js";
import { PageShell } from "../layout/PageShell.js";
import { Sidebar } from "../layout/Sidebar.js";
import { VirtualGrid } from "../grid/VirtualGrid.js";
import { FilterPanel } from "../filters/FilterPanel.js";
import { Chart } from "../charts/Chart.js";
import { ShareCard } from "../share/ShareCard.js";
import { DropZone } from "./DropZone.js";
import { MetricCards } from "./MetricCards.js";
import { RejectedRows } from "./RejectedRows.js";
import { buildChartData } from "./chartData.js";
import { useExplorer } from "./useExplorer.js";

const REJECTED_VIEW_ID = "__rejected__";

export interface ExplorerProps {
  readonly config: ExplorerConfig;
  readonly demoDataUrl?: string | undefined | undefined;
  readonly defaultShareMode?: ShareMode | undefined;
  readonly backHref?: string | undefined | undefined;
  readonly privacyNotice?: string | undefined | undefined;
  readonly initialTable?: Table | null | undefined;
}

/**
 * The explorer itself: drop a spreadsheet, get typed views, share the
 * exact same view through a link. Driven entirely by the app config —
 * the kit contains no business logic.
 */
export function Explorer({
  config,
  demoDataUrl,
  defaultShareMode,
  backHref,
  privacyNotice = "Your data stays here. Nothing is uploaded.",
  initialTable = null,
}: ExplorerProps) {
  const explorer = useExplorer(config, demoDataUrl, initialTable);
  const [shareMode] = useState<ShareMode>(defaultShareMode ?? "private");

  const view = useMemo(
    () => config.views.find((candidate) => candidate.id === explorer.activeViewId),
    [config.views, explorer.activeViewId],
  );

  const chartData = useMemo(
    () => buildChartData(explorer.table, view?.chart ?? null),
    [explorer.table, view],
  );

  const metrics = useMemo(() => {
    if (explorer.table === null) return [];
    return config.reducers.flatMap((reducer) =>
      reducer.reduce(explorer.table as NonNullable<typeof explorer.table>, explorer.state.query),
    );
  }, [config.reducers, explorer.table, explorer.state.query]);

  const gridColumns = useMemo(() => {
    if (explorer.table === null) return [];
    if (view === undefined || view.columns.length === 0) return explorer.table.columns;
    return view.columns.flatMap((id) => {
      const column = explorer.table?.columns.find((candidate) => candidate.id === id);
      return column === undefined ? [] : [column];
    });
  }, [explorer.table, view]);

  if (explorer.table === null) {
    return (
      <ThemeProvider theme={config.theme} i18n={config.i18n}>
        <PageShell title={config.title} backHref={backHref}>
          {explorer.restoreError === null ? null : (
            <p role="alert" className="bb-restore-error">
              {explorer.restoreError}
            </p>
          )}
          <DropZone
            onFile={(file) => void explorer.importFile(file)}
            onDemo={demoDataUrl === undefined ? undefined : () => void explorer.loadDemo()}
          />
        </PageShell>
      </ThemeProvider>
    );
  }

  const table = explorer.table;

  return (
    <ThemeProvider theme={config.theme} i18n={config.i18n}>
      <PageShell
        title={config.title}
        backHref={backHref}
        sidebar={
          <Sidebar
            items={[
              ...config.views.map((candidate) => ({ id: candidate.id, label: candidate.label })),
              ...(table.rejected.length > 0
                ? [{ id: REJECTED_VIEW_ID, label: "Rejected rows" }]
                : []),
            ]}
            activeId={explorer.activeViewId}
            onSelect={explorer.setActiveView}
            notice={privacyNotice}
          />
        }
      >
        {explorer.restoreError === null ? null : (
          <p role="alert" className="bb-restore-error">
            {explorer.restoreError}
          </p>
        )}

        {explorer.activeViewId === REJECTED_VIEW_ID ? (
          <RejectedRows table={table} />
        ) : (
          <>
            <MetricCards metrics={metrics} />
            <FilterPanel
              columns={table.columns}
              filters={explorer.state.query.filters}
              onChange={explorer.setFilters}
            />
            {view?.chart === null || view === undefined ? null : (
              <Chart
                kind={view.chart.kind}
                title={view.chart.title ?? view.label}
                points={chartData.points}
                values={chartData.values}
                results={chartData.results}
              />
            )}
            <VirtualGrid columns={gridColumns} rows={explorer.rows} caption={view?.label} />
          </>
        )}

        <ShareCard
          title="Share"
          payload={explorer.sharePayload}
          defaultMode={defaultShareMode ?? "private"}
        />
        <a
          className="bb-export"
          href={csvHref(table)}
          download={`${table.id}.csv`}
        >
          Export CSV
        </a>
      </PageShell>
    </ThemeProvider>
  );
}

function csvHref(table: Parameters<typeof tableToCsv>[0]): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(tableToCsv(table))}`;
}
