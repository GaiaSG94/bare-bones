import type {
  BareBonesError,
  ExplorerConfig,
  ExplorerConfig as Config,
} from "../types.js";
import { BareBonesError as BareBonesErrorClass } from "../types.js";

export interface ConfigProblem {
  readonly path: string;
  readonly message: string;
}

const REGISTRIES = [
  "importers",
  "derivations",
  "reducers",
  "views",
  "shareAdapters",
] as const;

export function validateConfig(config: Config): readonly ConfigProblem[] {
  const problems: ConfigProblem[] = [];
  if (config.id.trim() === "") {
    problems.push({ path: "id", message: "must not be empty" });
  }
  if (config.title.trim() === "") {
    problems.push({ path: "title", message: "must not be empty" });
  }
  for (const registry of REGISTRIES) {
    const entries = config[registry];
    if (!Array.isArray(entries) || entries.length === 0) {
      problems.push({ path: registry, message: "must declare at least one entry" });
      continue;
    }
    const ids = new Set<string>();
    for (const [index, entry] of entries.entries()) {
      const id = (entry as { id?: unknown }).id;
      if (typeof id !== "string" || id.trim() === "") {
        problems.push({ path: `${registry}[${index}].id`, message: "must be a non-empty string" });
        continue;
      }
      if (ids.has(id)) {
        problems.push({ path: `${registry}[${index}].id`, message: `duplicate id "${id}"` });
      }
      ids.add(id);
    }
  }
  if (config.views.length > 0) {
    for (const [index, view] of config.views.entries()) {
      for (const columnId of view.columns) {
        if (!columnId) {
          problems.push({ path: `views[${index}].columns`, message: "empty column id" });
        }
      }
    }
  }
  return problems;
}

export function assertValidConfig(config: Config): BareBonesError | null {
  const problems = validateConfig(config);
  if (problems.length === 0) return null;
  const detail = problems.map((p) => `${p.path}: ${p.message}`).join("; ");
  return new BareBonesErrorClass(
    "invalid-config",
    "This explorer configuration is not valid.",
    detail,
  );
}

export function findImporter(config: Config, fileName: string) {
  return config.importers.find((importer) =>
    importer.canHandle({ fileName, text: "" }),
  );
}

export type { ExplorerConfig };
