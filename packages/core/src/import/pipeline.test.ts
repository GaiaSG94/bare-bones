import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { decodeText } from "./encoding.js";
import { detectDelimiter, splitCsv } from "./csv.js";
import { importBytes, parseCsvText } from "./pipeline.js";

const SEED = 20261111;

describe("encoding", () => {
  it("strips the BOM and detects UTF-8", () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x61]);
    const decoded = decodeText(bytes);
    expect(decoded.encoding).toBe("utf-8");
    expect(decoded.text).toBe("a");
  });

  it("falls back to windows-1252 on invalid UTF-8", () => {
    const bytes = new Uint8Array([0x61, 0xe9]);
    const decoded = decodeText(bytes);
    expect(decoded.encoding).toBe("windows-1252");
    expect(decoded.text).toBe("a\u00e9");
  });

  it("round-trips any ASCII string through bytes", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 200 }), (text) => {
        const decoded = decodeText(new TextEncoder().encode(text));
        expect(decoded.text).toBe(text);
      }),
      { seed: SEED, numRuns: 200 },
    );
  });
});

describe("csv", () => {
  it("detects the separator from the header", () => {
    expect(detectDelimiter("a;b;c")).toBe(";");
    expect(detectDelimiter("a,b,c")).toBe(",");
  });

  it("keeps quoted separators and newlines", () => {
    const records = splitCsv('name;note\n"Smith, J.";"line1\nline2"\n', ";");
    expect(records[1]?.cells).toEqual(["Smith, J.", "line1\nline2"]);
  });

  it("parses a typed table with rejected rows", () => {
    const text = "date;amount;category\n01/02/2026;10,50;Grants\n;bad;Grants\n03/02/2026;20,00;Grants\n";
    const result = parseCsvText(text, { name: "test.csv" });
    expect(result.table.rows.length).toBe(2);
    expect(result.table.rejected.length).toBe(1);
    expect(result.table.rejected[0]?.reason).toBe("invalid-number");
    expect(result.table.columns.map((c) => c.type)).toEqual([
      "date",
      "number",
      "category",
    ]);
  });

  it("parses the same values in English style", () => {
    const text = 'date,amount\n2026-02-01,"1,240.00"\n';
    const result = parseCsvText(text, { name: "en.csv" });
    expect(result.table.rows[0]?.["amount"]).toBe(1240);
  });

  it("imports bytes with encoding detection", () => {
    const bytes = new TextEncoder().encode("a,b\n1,2\n");
    const result = importBytes(bytes, { name: "bytes.csv" });
    expect(result.table.rows[0]?.["a"]).toBe(1);
  });

  it("round-trips cell values through CSV text", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 40 }).filter((s) => !/[,;\n"]/.test(s)),
        (value) => {
          const text = `column\n${value}\n`;
          const result = parseCsvText(text, { name: "t.csv" });
          const cell = result.table.rows[0]?.["column"];
          if (value.trim() === "") {
            expect(cell ?? null).toBeNull();
          } else {
            expect(String(cell).trim()).toBe(value.trim());
          }
        },
      ),
      { seed: SEED, numRuns: 200 },
    );
  });
});
