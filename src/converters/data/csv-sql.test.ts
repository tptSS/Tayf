import { describe, expect, it } from "vitest";
import csvSqlConverter from "./csv-sql";

describe("csv-sql", () => {
  it("CSV'den CREATE TABLE + INSERT üretir", async () => {
    const encoder = new TextEncoder();
    const csv = "ad,yas\nAyşe,29\nMehmet,34\n";

    const outputs = await csvSqlConverter.run(
      { files: [{ name: "kisiler.csv", data: encoder.encode(csv).buffer }] },
      { dialect: "sqlite", tableName: "kisiler", includeCreateTable: true, batchSize: 100 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.sql");
    expect(outputs[0].data).toContain("CREATE TABLE");
    expect(outputs[0].data).toContain("INSERT INTO");
    expect(outputs[0].data).toContain("Ayşe");
  });
});
