import type { Column, Filter } from "@bare-bones/core";

export interface FilterPanelProps {
  readonly columns: readonly Column[];
  readonly filters: readonly Filter[];
  readonly onChange: (filters: readonly Filter[]) => void;
}

function columnOf(columns: readonly Column[], columnId: string): Column | undefined {
  return columns.find((column) => column.id === columnId);
}

/**
 * Filter controls. One block per active filter; the panel is driven by
 * the view state, not by local UI state, so shared links restore it.
 */
export function FilterPanel({ columns, filters, onChange }: FilterPanelProps) {
  if (filters.length === 0) return null;

  return (
    <section className="bb-filters" aria-label="Filters">
      {filters.map((filter, index) => {
        const column = columnOf(columns, filter.columnId);
        if (column === undefined) return null;
        return (
          <div className="bb-filter" key={`${filter.kind}-${filter.columnId}`}>
            <span className="bb-filter-label">{column.label}</span>
            {filter.kind === "range" ? (
              <span className="bb-filter-range">
                <input
                  type="number"
                  aria-label={`${column.label} from`}
                  value={filter.min ?? ""}
                  onChange={(event) =>
                    update(index, { ...filter, min: event.target.value === "" ? null : Number(event.target.value) })
                  }
                />
                <input
                  type="number"
                  aria-label={`${column.label} to`}
                  value={filter.max ?? ""}
                  onChange={(event) =>
                    update(index, { ...filter, max: event.target.value === "" ? null : Number(event.target.value) })
                  }
                />
              </span>
            ) : filter.kind === "multi-select" ? (
              <fieldset>
                {levelsOf(column).map((level) => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      checked={filter.values.includes(level)}
                      onChange={(event) =>
                        update(index, {
                          ...filter,
                          values: event.target.checked
                            ? [...filter.values, level]
                            : filter.values.filter((v) => v !== level),
                        })
                      }
                    />
                    {level}
                  </label>
                ))}
              </fieldset>
            ) : (
              <input
                type="search"
                aria-label={`Search ${column.label}`}
                value={filter.term}
                onChange={(event) => update(index, { ...filter, term: event.target.value })}
              />
            )}
          </div>
        );
      })}
      <button type="button" className="bb-filter-clear" onClick={() => onChange([])}>
        Clear filters
      </button>
    </section>
  );

  function update(index: number, filter: Filter) {
    onChange(filters.map((current, i) => (i === index ? filter : current)));
  }
}

function levelsOf(column: Column): readonly string[] {
  return column.format.kind === "category" ? column.format.levels : [];
}
