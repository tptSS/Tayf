import { describe, expect, it } from "vitest";
import csvExcelConverter from "./csv-excel";
import { rowsFromExcelBytes } from "./shared";

describe("csv-excel", () => {
  it("CSV'yi Excel'e çevirir", async () => {
    const encoder = new TextEncoder();
    const csv = "ad,sehir\nAyşe,İstanbul\nMehmet,Ankara\n";

    const outputs = await csvExcelConverter.run(
      { files: [{ name: "kisiler.csv", data: encoder.encode(csv).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("kisiler.xlsx");
    const rows = await rowsFromExcelBytes(outputs[0].data as ArrayBuffer);
    expect(rows).toEqual([
      { ad: "Ayşe", sehir: "İstanbul" },
      { ad: "Mehmet", sehir: "Ankara" },
    ]);
  });
});
