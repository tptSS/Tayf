import { describe, expect, it } from "vitest";
import excelXmlConverter from "./excel-xml";
import { excelBytesFromRows, rowsFromXmlText, toArrayBuffer } from "./shared";

describe("excel-xml", () => {
  it("Excel dosyasını XML'e çevirir ve geri okunabilir", async () => {
    const rows = [
      { ad: "Ayşe", sehir: "İstanbul" },
      { ad: "Mehmet", sehir: "Ankara" },
    ];
    const bytes = toArrayBuffer(await excelBytesFromRows(rows));

    const outputs = await excelXmlConverter.run(
      { files: [{ name: "kisiler.xlsx", data: bytes }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.xml");
    const roundTripped = await rowsFromXmlText(outputs[0].data as string);
    expect(roundTripped).toEqual(rows);
  });
});
