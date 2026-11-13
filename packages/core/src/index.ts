/**
 * Public API of @bare-bones/core. Frozen contract: see docs/CONTRACTS.md.
 * Apps must import from the package root only.
 */

export type {
  BareBonesErrorCode,
  CellValue,
  ChartKind,
  ChartSpec,
  Column,
  ColumnFormat,
  ColumnType,
  DateFormat,
  DatePattern,
  Derivation,
  ExplorerConfig,
  Filter,
  I18nBundle,
  ImportContext,
  ImportOutcome,
  Importer,
  Measure,
  MeasureKind,
  Metric,
  NumberFormat,
  OutcomeFormat,
  Query,
  Reducer,
  RejectedRow,
  RejectionReason,
  Row,
  ShareAdapter,
  ShareMode,
  SharePayload,
  SortSpec,
  Table,
  TextFormat,
  ThemeTokens,
  ViewOptionValue,
  ViewSpec,
  ViewState,
} from "./types.js";

export { BareBonesError } from "./types.js";

export {
  columnFormatSchema,
  columnSchema,
  columnTypeSchema,
  querySchema,
  sharePayloadSchema,
  tableSchema,
  viewStateSchema,
} from "./schema.js";

export { decodeText, stripBom } from "./import/encoding.js";
export { detectDelimiter, splitCsv } from "./import/csv.js";
export { parseDate, detectDatePattern, DATE_PATTERNS } from "./import/dates.js";
export { parseNumber, detectDecimalSeparator } from "./import/values.js";
export { buildTable, slugify } from "./import/table.js";
export { importBytes, parseCsvText } from "./import/pipeline.js";
export { attachWorker, handleRequest } from "./import/worker.js";

export { applyFilters, matchesFilter, selectRows, sortRows } from "./query/rows.js";
export { aggregate, aggregateToMetrics } from "./query/aggregate.js";

export {
  createViewState,
  emptyQuery,
  viewStatesEqual,
  withFilters,
  withSort,
} from "./state/view-state.js";

export { tableToCsv, escapeCsvField } from "./export/csv.js";

export {
  assertValidConfig,
  findImporter,
  validateConfig,
} from "./config/config.js";
export { createTranslator, withFallbacks } from "./i18n/translator.js";
export type { Translator } from "./i18n/translator.js";

export {
  SHARE_PREFIX,
  SHARE_VERSION,
  buildFragment,
  decodeLink,
  decodePrivateLink,
  decodePublicLink,
  encodeLink,
  encodePrivateLink,
  encodePublicLink,
  readFragment,
  shareError,
} from "./share/link.js";
export { decodeBase64Url, encodeBase64Url } from "./share/base64.js";
export { deflateRaw, inflateRaw } from "./share/compress.js";
export { decrypt, encrypt, generateKey } from "./share/crypto.js";
