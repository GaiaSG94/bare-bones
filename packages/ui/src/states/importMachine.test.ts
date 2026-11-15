import { describe, expect, it } from "vitest";
import { countRows, faultyIndices, headerOf, rawCells, rejectedCsv } from "./importMachine.js";
import type { Column, RejectionReason } from "@bare-bones/core";

const COLUMNS: readonly Column[] = [
  { id: "date", label: "Date", type: "date", format: { kind: "date", pattern: "yyyy-mm-dd" } },
  { id: "label", label: "Label", type: "text", format: { kind: "text" } },
  { id: "amount", label: "Amount", type: "number", format: { kind: "number", decimals: 2, locale: "fr" } },
];

describe("import machine", () => {
  it("counts data rows below the header", () => {
    expect(countRows("date,amount\n2026-01-01,12\n\n2026-01-02,9")).toBe(2);
    expect(countRows("date,amount")).toBe(0);
    expect(countRows("")).toBe(0);
  });

  it("reads the header with the detected delimiter", () => {
    expect(headerOf("date;label;amount")).toEqual(["date", "label", "amount"]);
    expect(headerOf("date,label")).toEqual(["date", "label"]);
  });

  it("splits a raw row into cells", () => {
    expect(rawCells("2026-02-31;Bake sale;240")).toEqual(["2026-02-31", "Bake sale", "240"]);
  });

  it("highlights the date cell on an invalid date", () => {
    expect(faultyIndices("2026-02-31;Bake sale;240", "invalid-date", COLUMNS)).toEqual([0]);
    expect(faultyIndices("2026-05-02;Paint;12,5O", "invalid-number", COLUMNS)).toEqual([2]);
  });

  it("highlights the whole row for structural failures", () => {
    expect(faultyIndices(";;;", "empty-line", COLUMNS)).toBeNull();
    expect(faultyIndices("1;2", "column-count", COLUMNS)).toBeNull();
  });

  it("builds the rejected-rows CSV", () => {
    const csv = rejectedCsv([{ line: 812, raw: "2026-02-31", reason: "invalid-date" }]);
    expect(csv.split("\r\n")[0]).toBe("line,reason,why,raw");
    expect(csv).toContain("812,invalid-date,Date does not exist,2026-02-31");
  });
});
