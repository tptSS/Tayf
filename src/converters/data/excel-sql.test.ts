import { describe, expect, it } from "vitest";
import excelSqlConverter from "./excel-sql";
import { excelBytesFromRows, toArrayBuffer } from "./shared";

describe("excel-sql", () => {
  it("Excel'den CREATE TABLE + INSERT üretir", async () => {
    const bytes = toArrayBuffer(await excelBytesFromRows([{ ad: "Ayşe", yas: "29" }]));

    const outputs = await excelSqlConverter.run(
      { files: [{ name: "kisiler.xlsx", data: bytes }] },
      { dialect: "mysql", tableName: "kisiler", includeCreateTable: false, batchSize: 100 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.sql");
    expect(outputs[0].data).toContain("INSERT INTO `kisiler`");
  });
});
