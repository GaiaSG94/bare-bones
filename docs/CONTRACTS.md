# Public API contracts (frozen)

The public API of `@bare-bones/core` and `@bare-bones/ui` is **frozen**:
apps import from the package root only, and any change must be **additive**.
CI enforces this with the "public API only" guard (`tools/guard.mjs`).

## `@bare-bones/core`

### Types (`src/types.ts`)

| Symbol | Purpose |
| --- | --- |
| `ColumnType` | `date \| text \| category \| number \| outcome` |
| `Column`, `ColumnFormat` | a column and its discriminated format descriptor |
| `CellValue`, `Row` | `string \| number \| boolean \| Date \| null`, keyed by column id |
| `Table` | id, name, columns, rows, rejected rows |
| `RejectedRow`, `RejectionReason` | a row that could not be read, with its reason |
| `BareBonesError` | error class with a machine-readable `code` |
| `Filter`, `Query`, `SortSpec`, `Measure`, `AggregationSpec` | the query model |
| `ViewState` | what determines the rendered view |
| `Importer`, `Derivation`, `Reducer`, `ViewSpec`, `ShareAdapter` | the five extension points |
| `ExplorerConfig` | the five registries plus theme and i18n declarations |
| `ThemeTokens`, `I18nBundle` | declarative theming and translations |

### Import (`src/import/`)

`decodeText`, `parseCsvText`, `importBytes`, `buildTable`, `parseNumber`,
`parseDate`, `detectDatePattern`, `detectDelimiter`, `splitCsv`,
`detectDecimalSeparator`, `slugify`, `attachWorker`, `handleRequest`.

### Query (`src/query/`)

`applyFilters`, `matchesFilter`, `selectRows`, `sortRows`, `aggregate`,
`aggregateToMetrics`.

### State (`src/state/`)

`createViewState`, `emptyQuery`, `withFilters`, `withSort`,
`viewStatesEqual`.

### Share (`src/share/`)

`encodeLink`, `decodeLink`, `encodePublicLink`, `decodePublicLink`,
`encodePrivateLink`, `decodePrivateLink`, `buildFragment`, `readFragment`,
`shareError`, `encodeBase64Url`, `decodeBase64Url`, `deflateRaw`,
`inflateRaw`, `encrypt`, `decrypt`, `generateKey`.

### Export (`src/export/`)

`tableToCsv`, `escapeCsvField`.

### Config & i18n (`src/config/`, `src/i18n/`)

`validateConfig`, `assertValidConfig`, `findImporter`, `createTranslator`,
`withFallbacks`.

### Schemas (`src/schema.ts`)

Zod schemas for every boundary payload: `tableSchema`, `viewStateSchema`,
`querySchema`, `sharePayloadSchema`, `columnSchema`, `columnTypeSchema`,
`columnFormatSchema`.

## `@bare-bones/ui`

### Theme

`ThemeProvider`, `useBbTheme`, `DEFAULT_THEME`, `themeToCssVars`.

### Layout

`PageShell`, `Sidebar`.

### Grid

`VirtualGrid`, `computeWindow`.

### Filters

`FilterPanel`.

### Charts

`Chart` (dispatcher), `ChartFrame`, `BarChart`, `LineChart`,
`DistributionChart`, `FormChart`, `DeltaBarChart`, `BubbleChart`,
`binValues`, `formatNumber`, `pointsToText`, `extent`, `paddedExtent`,
`scaleLinear`, `ticks`.

### Share

`ShareCard`, `useShareLink`, `useHashToken`.

### Explorer

`Explorer`, `useExplorer`, `DropZone`, `MetricCards`, `RejectedRows`,
`buildChartData`.

### Styles

`@bare-bones/ui/styles.css` — the base stylesheet. It only references CSS
custom properties, never hardcoded colors.

## Link format

```
#bb=v1.p.<base64url(deflate-raw(json))>          public: view state only
#bb=v1.s.<base64url(iv|ciphertext)>.<base64url(key)>  private: AES-GCM-256
```

The fragment is never sent to a server. A corrupted link raises
`BareBonesError` with code `invalid-share`, so views can show a fallback
message instead of a broken screen.
