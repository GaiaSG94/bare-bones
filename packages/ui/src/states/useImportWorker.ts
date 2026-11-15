import type { ImportOutcome } from "@bare-bones/core";
import { decodeText } from "@bare-bones/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { countRows, headerOf } from "./importMachine.js";

export type ImportPhase = "idle" | "columns" | "rows" | "building" | "done" | "error";

export interface ImportState {
  readonly phase: ImportPhase;
  readonly fileName: string;
  readonly fileSize: number;
  readonly totalRows: number;
  readonly header: readonly string[];
  readonly outcome: ImportOutcome | null;
  readonly error: string | null;
}

export interface ImportWorkerOptions {
  /** The app owns the worker file; the kit only drives it. */
  readonly createWorker: () => Worker;
  readonly onComplete: (outcome: ImportOutcome) => void;
}

export interface UseImportWorker {
  readonly state: ImportState;
  readonly start: (file: File) => void;
  readonly cancel: () => void;
}

const IDLE: ImportState = {
  phase: "idle",
  fileName: "",
  fileSize: 0,
  totalRows: 0,
  header: [],
  outcome: null,
  error: null,
};

/**
 * Drives the real import worker: columns, then rows checked in the
 * background worker, then the explorer is built. The counters are real.
 */
export function useImportWorker({ createWorker, onComplete }: ImportWorkerOptions): UseImportWorker {
  const [state, setState] = useState<ImportState>(IDLE);
  const workerRef = useRef<Worker | null>(null);

  const cancel = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setState(IDLE);
  }, []);

  const start = useCallback(
    (file: File) => {
      workerRef.current?.terminate();
      setState({ ...IDLE, phase: "columns", fileName: file.name, fileSize: file.size });
      void file.arrayBuffer().then((buffer) => {
        const decoded = decodeText(new Uint8Array(buffer));
        const header = headerOf(decoded.text);
        const totalRows = countRows(decoded.text);
        setState((current) => ({ ...current, phase: "rows", header, totalRows }));
        const worker = createWorker();
        workerRef.current = worker;
        worker.onmessage = (event: MessageEvent<{ outcome: ImportOutcome | null; error: string | null }>) => {
          worker.terminate();
          workerRef.current = null;
          if (event.data.outcome === null) {
            setState((current) => ({
              ...current,
              phase: "error",
              error: event.data.error ?? "The file could not be read.",
            }));
            return;
          }
          setState((current) => ({ ...current, phase: "building" }));
          setState((current) => ({ ...current, phase: "done", outcome: event.data.outcome }));
          onComplete(event.data.outcome);
        };
        worker.onerror = () => {
          worker.terminate();
          workerRef.current = null;
          setState((current) => ({ ...current, phase: "error", error: "The import worker stopped." }));
        };
        worker.postMessage({ id: file.name, name: file.name, bytes: buffer });
      });
    },
    [createWorker, onComplete],
  );

  useEffect(() => () => workerRef.current?.terminate(), []);

  return { state, start, cancel };
}
