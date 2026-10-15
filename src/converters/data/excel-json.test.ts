import { describe, expect, it } from "vitest";
import excelJsonConverter from "./excel-json";
import { excelBytesFromRows, toArrayBuffer } from "./shared";

describe("excel-json", () => {
  it("Excel dosyasını JSON'a çevirir", async () => {
    const rows = [{ ad: "Ayşe", yas: "29" }];
    const bytes = toArrayBuffer(await excelBytesFromRows(rows));

    const outputs = await excelJsonConverter.run(
      { files: [{ name: "kisiler.xlsx", data: bytes }] },
      { pretty: false },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.json");
    expect(JSON.parse(outputs[0].data as string)).toEqual(rows);
  });
});
