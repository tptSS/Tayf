import { describe, expect, it } from "vitest";
import excelCsvConverter from "./excel-csv";
import { excelBytesFromRows, toArrayBuffer } from "./shared";

describe("excel-csv", () => {
  it("Excel dosyasını CSV'ye çevirir", async () => {
    const rows = [
      { ad: "Ayşe", sehir: "İstanbul" },
      { ad: "Mehmet", sehir: "Ankara" },
    ];
    const bytes = toArrayBuffer(await excelBytesFromRows(rows));

    const outputs = await excelCsvConverter.run(
      { files: [{ name: "kisiler.xlsx", data: bytes }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("kisiler.csv");
    expect(outputs[0].data).toContain("Ayşe");
    expect(outputs[0].data).toContain("İstanbul");
  });
});
