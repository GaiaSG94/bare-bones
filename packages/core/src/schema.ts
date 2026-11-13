import { z } from "zod";

export const columnTypeSchema = z.enum([
  "date",
  "text",
  "category",
  "number",
  "outcome",
]);

export const dateFormatSchema = z.object({
  kind: z.literal("date"),
  pattern: z.enum(["dd/mm/yyyy", "yyyy-mm-dd", "dd-mm-yyyy"]),
});

export const numberFormatSchema = z.object({
  kind: z.literal("number"),
  decimals: z.number().int().min(0).max(6),
  locale: z.enum(["fr", "en"]),
});

export const categoryFormatSchema = z.object({
  kind: z.literal("category"),
  levels: z.array(z.string()),
});

export const outcomeFormatSchema = z.object({
  kind: z.literal("outcome"),
  positive: z.array(z.string()),
  neutral: z.array(z.string()),
  negative: z.array(z.string()),
});

export const textFormatSchema = z.object({ kind: z.literal("text") });

export const columnFormatSchema = z.discriminatedUnion("kind", [
  textFormatSchema,
  dateFormatSchema,
  numberFormatSchema,
  categoryFormatSchema,
  outcomeFormatSchema,
]);

export const columnSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: columnTypeSchema,
  format: columnFormatSchema,
});

export const cellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.date(),
  z.null(),
]);

export const rowSchema = z.record(z.string(), cellValueSchema);

export const rejectionReasonSchema = z.enum([
  "empty-line",
  "column-count",
  "invalid-date",
  "invalid-number",
  "unparseable",
]);

export const rejectedRowSchema = z.object({
  line: z.number().int().min(1),
  raw: z.string(),
  reason: rejectionReasonSchema,
  detail: z.string().optional(),
});

export const tableSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  columns: z.array(columnSchema),
  rows: z.array(rowSchema),
  rejected: z.array(rejectedRowSchema),
});

export const filterSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("range"),
    columnId: z.string(),
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  z.object({
    kind: z.literal("multi-select"),
    columnId: z.string(),
    values: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("text"),
    columnId: z.string(),
    term: z.string(),
    caseSensitive: z.boolean(),
  }),
]);

export const sortSpecSchema = z.object({
  columnId: z.string(),
  direction: z.enum(["asc", "desc"]),
});

export const measureSchema = z.object({
  kind: z.enum(["count", "sum", "mean", "min", "max"]),
  columnId: z.string().nullable(),
  as: z.string().min(1),
});

export const aggregationSpecSchema = z.object({
  groupBy: z.array(z.string()),
  measures: z.array(measureSchema),
});

export const querySchema = z.object({
  filters: z.array(filterSchema),
  sort: sortSpecSchema.nullable(),
  aggregation: aggregationSpecSchema.nullable(),
});

export const viewStateSchema = z.object({
  tableId: z.string(),
  query: querySchema,
  viewId: z.string(),
  options: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const sharePayloadSchema = z.object({
  version: z.literal(1),
  state: viewStateSchema,
  data: tableSchema.nullable(),
  meta: z.record(z.string()),
});
