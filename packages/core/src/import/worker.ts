import type { ImportOutcome } from "../types.js";
import { importBytes } from "./pipeline.js";

export interface WorkerRequest {
  readonly id: string;
  readonly name: string;
  readonly bytes: ArrayBuffer;
}

export interface WorkerResponse {
  readonly id: string;
  readonly outcome: ImportOutcome | null;
  readonly error: string | null;
}

export function handleRequest(request: WorkerRequest): WorkerResponse {
  try {
    const result = importBytes(request.bytes, { name: request.name });
    return {
      id: request.id,
      outcome: { table: result.table, warnings: result.warnings },
      error: null,
    };
  } catch (error) {
    return {
      id: request.id,
      outcome: null,
      error: error instanceof Error ? error.message : "Import failed.",
    };
  }
}

/**
 * Installs the import message handler on a worker scope. Kept separate
 * from the handler logic so it stays testable without a worker.
 */
export function attachWorker(scope: {
  addEventListener(type: "message", listener: (event: MessageEvent<WorkerRequest>) => void): void;
  postMessage(message: WorkerResponse): void;
}): void {
  scope.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
    scope.postMessage(handleRequest(event.data));
  });
}
