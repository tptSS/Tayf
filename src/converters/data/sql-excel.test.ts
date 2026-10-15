import { describe, expect, it } from "vitest";
import sqlExcelConverter from "./sql-excel";
import { rowsFromExcelBytes } from "./shared";

describe("sql-excel", () => {
  it("INSERT ifadelerini Excel'e çevirir", async () => {
    const encoder = new TextEncoder();
    const sql = `INSERT INTO "kisiler" ("ad") VALUES ('Ayşe');`;

    const outputs = await sqlExcelConverter.run(
      { files: [{ name: "kisiler.sql", data: encoder.encode(sql).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.xlsx");
    const rows = await rowsFromExcelBytes(outputs[0].data as ArrayBuffer);
    expect(rows).toEqual([{ ad: "Ayşe" }]);
  });
});
