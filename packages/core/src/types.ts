/**
 * Frozen type spine of Bare Bones. Every other package is written against
 * these types; changes here are additive only (see docs/CONTRACTS.md).
 */

export type ColumnType = "date" | "text" | "category" | "number" | "outcome";

export type CellValue = string | number | boolean | Date | null;

export interface TextFormat {
  readonly kind: "text";
}

export type DatePattern = "dd/mm/yyyy" | "yyyy-mm-dd" | "dd-mm-yyyy";

export interface DateFormat {
  readonly kind: "date";
  readonly pattern: DatePattern;
}

export interface NumberFormat {
  readonly kind: "number";
  readonly decimals: number;
  readonly locale: "fr" | "en";
}

export interface CategoryFormat {
  readonly kind: "category";
  readonly levels: readonly string[];
}

export interface OutcomeFormat {
  readonly kind: "outcome";
  readonly positive: readonly string[];
  readonly neutral: readonly string[];
  readonly negative: readonly string[];
}

export type ColumnFormat =
  | TextFormat
  | DateFormat
  | NumberFormat
  | CategoryFormat
  | OutcomeFormat;

export interface Column {
  readonly id: string;
  readonly label: string;
  readonly type: ColumnType;
  readonly format: ColumnFormat;
}

export type Row = { readonly [columnId: string]: CellValue };

export type RejectionReason =
  | "empty-line"
  | "column-count"
  | "invalid-date"
  | "invalid-number"
  | "unparseable";

export interface RejectedRow {
  readonly line: number;
  readonly raw: string;
  readonly reason: RejectionReason;
  readonly detail?: string | undefined;
}

export interface Table {
  readonly id: string;
  readonly name: string;
  readonly columns: readonly Column[];
  readonly rows: readonly Row[];
  readonly rejected: readonly RejectedRow[];
}

export type BareBonesErrorCode =
  | "import-failed"
  | "invalid-share"
  | "decode-failed"
  | "unknown-view"
  | "invalid-config"
  | "crypto-failed";

/**
 * The error type of the skeleton. It carries a machine-readable code so
 * views can react (a corrupted link shows a fallback message) instead of
 * crashing on a raw parser exception.
 */
export class BareBonesError extends Error {
  readonly code: BareBonesErrorCode;
  readonly detail: string | undefined;

  constructor(code: BareBonesErrorCode, message: string, detail?: string) {
    super(message);
    this.name = "BareBonesError";
    this.code = code;
    this.detail = detail;
  }
}

export type Filter =
  | {
      readonly kind: "range";
      readonly columnId: string;
      readonly min: number | null;
      readonly max: number | null;
    }
  | {
      readonly kind: "multi-select";
      readonly columnId: string;
      readonly values: readonly string[];
    }
  | {
      readonly kind: "text";
      readonly columnId: string;
      readonly term: string;
      readonly caseSensitive: boolean;
    };

export interface SortSpec {
  readonly columnId: string;
  readonly direction: "asc" | "desc";
}

export type MeasureKind = "count" | "sum" | "mean" | "min" | "max";

export interface Measure {
  readonly kind: MeasureKind;
  readonly columnId: string | null;
  readonly as: string;
}

export interface AggregationSpec {
  readonly groupBy: readonly string[];
  readonly measures: readonly Measure[];
}

export interface Query {
  readonly filters: readonly Filter[];
  readonly sort: SortSpec | null;
  readonly aggregation: AggregationSpec | null;
}

export type ViewOptionValue = string | number | boolean;

export interface ViewState {
  readonly tableId: string;
  readonly query: Query;
  readonly viewId: string;
  readonly options: Readonly<Record<string, ViewOptionValue>>;
}

export interface ImportContext {
  readonly fileName: string;
  readonly text: string;
}

export interface ImportOutcome {
  readonly table: Table;
  readonly warnings: readonly string[];
}

export interface Importer {
  readonly id: string;
  readonly label: string;
  canHandle(context: ImportContext): boolean;
  parse(context: ImportContext): ImportOutcome;
}

export interface Derivation {
  readonly id: string;
  readonly label: string;
  derive(table: Table): Table;
}

export interface Metric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string | null;
  readonly detail: string | null;
}

export interface Reducer {
  readonly id: string;
  readonly label: string;
  reduce(table: Table, query: Query): readonly Metric[];
}

export type ChartKind =
  | "bar"
  | "line"
  | "area"
  | "distribution"
  | "form"
  | "delta-bar"
  | "bubble";

export interface ChartSpec {
  readonly kind: ChartKind;
  readonly x: string | null;
  readonly y: string | null;
  readonly series: string | null;
  readonly title: string | null;
}

export interface ViewSpec {
  readonly id: string;
  readonly label: string;
  readonly description: string | null;
  readonly columns: readonly string[];
  readonly chart: ChartSpec | null;
  readonly filters: readonly Filter[];
}

export interface SharePayload {
  readonly version: 1;
  readonly state: ViewState;
  readonly data: Table | null;
  readonly meta: Readonly<Record<string, string>>;
}

export type ShareMode = "public" | "private";

export interface ShareAdapter {
  readonly id: string;
  readonly label: string;
  readonly mode: ShareMode;
  encode(payload: SharePayload): Promise<string>;
  decode(token: string): Promise<SharePayload>;
}

export interface ThemeTokens {
  readonly colors: Readonly<Record<string, string>>;
  readonly fonts: Readonly<Record<string, string>>;
  readonly radii: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
}

export interface I18nBundle {
  readonly locale: string;
  readonly strings: Readonly<Record<string, string>>;
}

export interface ExplorerConfig {
  readonly id: string;
  readonly title: string;
  readonly importers: readonly Importer[];
  readonly derivations: readonly Derivation[];
  readonly reducers: readonly Reducer[];
  readonly views: readonly ViewSpec[];
  readonly shareAdapters: readonly ShareAdapter[];
  readonly theme: ThemeTokens;
  readonly i18n: I18nBundle;
}
