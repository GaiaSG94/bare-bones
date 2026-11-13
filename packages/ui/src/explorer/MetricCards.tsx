import type { Metric } from "@bare-bones/core";

/** Metric cards above charts: label, value, unit and detail. */
export function MetricCards({ metrics }: { metrics: readonly Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <section className="bb-metrics" aria-label="Key figures">
      {metrics.map((metric) => (
        <article className="bb-metric" key={metric.id}>
          <span className="bb-metric-label">{metric.label}</span>
          <span className="bb-metric-value">
            {formatValue(metric.value)}
            {metric.unit === null ? "" : ` ${metric.unit}`}
          </span>
          {metric.detail === null ? null : (
            <span className="bb-metric-detail">{metric.detail}</span>
          )}
        </article>
      ))}
    </section>
  );
}

function formatValue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
