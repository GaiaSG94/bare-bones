import type { Table } from "@bare-bones/core";

/**
 * The rejected-rows panel: every row that could not be read, with its
 * reason, so nothing disappears silently.
 */
export function RejectedRows({ table }: { table: Table }) {
  if (table.rejected.length === 0) {
    return <p className="bb-rejected-empty">Every row was read. Nothing was rejected.</p>;
  }
  return (
    <section className="bb-rejected" aria-label="Rejected rows">
      <p>
        {table.rejected.length} row{table.rejected.length === 1 ? "" : "s"} could not be
        read and are kept out of the data.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Line</th>
            <th scope="col">Reason</th>
            <th scope="col">Detail</th>
            <th scope="col">Raw</th>
          </tr>
        </thead>
        <tbody>
          {table.rejected.map((row) => (
            <tr key={row.line}>
              <td>{row.line}</td>
              <td>{row.reason}</td>
              <td>{row.detail ?? ""}</td>
              <td>
                <code>{row.raw}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
