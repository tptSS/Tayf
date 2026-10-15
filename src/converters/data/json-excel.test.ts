import { describe, expect, it } from "vitest";
import jsonExcelConverter from "./json-excel";
import { rowsFromExcelBytes } from "./shared";

describe("json-excel", () => {
  it("JSON'u Excel'e çevirir", async () => {
    const encoder = new TextEncoder();
    const json = JSON.stringify([{ ad: "Ayşe", yas: "29" }]);

    const outputs = await jsonExcelConverter.run(
      { files: [{ name: "kisiler.json", data: encoder.encode(json).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.xlsx");
    const rows = await rowsFromExcelBytes(outputs[0].data as ArrayBuffer);
    expect(rows).toEqual([{ ad: "Ayşe", yas: "29" }]);
  });

  it("kök öğesi dizi olmayan JSON için anlamlı hata verir", async () => {
    const encoder = new TextEncoder();
    await expect(
      jsonExcelConverter.run(
        { files: [{ name: "x.json", data: encoder.encode("{}").buffer }] },
        {},
        { progress: () => {}, signal: new AbortController().signal },
      ),
    ).rejects.toThrow("dizi olmalı");
  });
});
