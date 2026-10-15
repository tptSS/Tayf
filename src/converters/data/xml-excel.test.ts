import { describe, expect, it } from "vitest";
import xmlExcelConverter from "./xml-excel";
import { rowsFromExcelBytes, xmlFromRows } from "./shared";

describe("xml-excel", () => {
  it("XML'i Excel'e çevirir", async () => {
    const rows = [{ ad: "Ayşe", sehir: "İstanbul" }];
    const xml = await xmlFromRows(rows);
    const encoder = new TextEncoder();

    const outputs = await xmlExcelConverter.run(
      { files: [{ name: "kisiler.xml", data: encoder.encode(xml).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.xlsx");
    const roundTripped = await rowsFromExcelBytes(outputs[0].data as ArrayBuffer);
    expect(roundTripped).toEqual(rows);
  });
});
