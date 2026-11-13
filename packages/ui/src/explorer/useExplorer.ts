import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ExplorerConfig,
  SharePayload,
  Table,
  ViewState,
} from "@bare-bones/core";
import {
  createViewState,
  decodeLink,
  decodeText,
  findImporter,
  selectRows,
} from "@bare-bones/core";

export interface ExplorerState {
  readonly table: Table | null;
  readonly state: ViewState;
  readonly activeViewId: string;
  readonly rows: ReturnType<typeof selectRows>;
  readonly sharePayload: SharePayload;
  readonly restoreError: string | null;
}

export interface ExplorerApi extends ExplorerState {
  readonly setActiveView: (viewId: string) => void;
  readonly setFilters: (filters: ViewState["query"]["filters"]) => void;
  readonly setSort: (sort: ViewState["query"]["sort"]) => void;
  readonly importFile: (file: File) => Promise<void>;
  readonly loadDemo: () => Promise<void>;
}

function applyDerivations(config: ExplorerConfig, table: Table): Table {
  return config.derivations.reduce((current, derivation) => derivation.derive(current), table);
}

function parseText(
  config: ExplorerConfig,
  fileName: string,
  text: string,
): Table {
  const importer = findImporter(config, fileName);
  if (importer !== undefined) {
    return importer.parse({ fileName, text }).table;
  }
  const fallback = config.importers[0];
  if (fallback === undefined) {
    throw new Error("This explorer has no importer.");
  }
  return fallback.parse({ fileName, text }).table;
}

/**
 * Owns the explorer state: table, view state and the link restore.
 * The URL fragment is the only persistence: opening a shared link
 * rebuilds the exact same view.
 */
export function useExplorer(
  config: ExplorerConfig,
  demoDataUrl: string | undefined,
  initialTable?: Table | null,
): ExplorerApi {
  const [table, setTable] = useState<Table | null>(initialTable ?? null);
  const [state, setState] = useState<ViewState>(() =>
    createViewState("local", config.views[0]?.id ?? "overview"),
  );
  const [activeViewId, setActiveViewId] = useState(config.views[0]?.id ?? "overview");
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof location === "undefined") return;
    const hash = location.hash;
    if (!hash.includes("bb=")) return;
    decodeLink(hash)
      .then((decoded) => {
        if (decoded.payload.data !== null) {
          setTable(decoded.payload.data);
        }
        setState(decoded.payload.state);
        setActiveViewId(decoded.payload.state.viewId);
      })
      .catch(() => {
        setRestoreError(
          "This link could not be read. It may have been truncated or edited.",
        );
      });
  }, []);

  const importFile = useCallback(
    async (file: File) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const decoded = decodeText(bytes);
      const imported = parseText(config, file.name, decoded.text);
      setTable(applyDerivations(config, imported));
    },
    [config],
  );

  const loadDemo = useCallback(async () => {
    if (demoDataUrl === undefined) return;
    const response = await fetch(demoDataUrl);
    const text = await response.text();
    const imported = parseText(config, demoDataUrl, text);
    setTable(applyDerivations(config, imported));
  }, [config, demoDataUrl]);

  const rows = useMemo(
    () => (table === null ? [] : selectRows(table, state.query)),
    [table, state.query],
  );

  const sharePayload = useMemo<SharePayload>(
    () => ({
      version: 1,
      state: { ...state, viewId: activeViewId },
      data: table,
      meta: { title: config.title },
    }),
    [state, activeViewId, table, config.title],
  );

  return {
    table,
    state,
    activeViewId,
    rows,
    sharePayload,
    restoreError,
    setActiveView,
    setFilters: (filters) => setState((current) => ({ ...current, query: { ...current.query, filters } })),
    setSort: (sort) => setState((current) => ({ ...current, query: { ...current.query, sort } })),
    importFile,
    loadDemo,
  };

  function setActiveView(viewId: string) {
    setActiveViewId(viewId);
    const view = config.views.find((candidate) => candidate.id === viewId);
    if (view === undefined) return;
    setState((current) => ({
      ...current,
      viewId,
      query: { ...current.query, filters: view.filters },
    }));
  }
}
