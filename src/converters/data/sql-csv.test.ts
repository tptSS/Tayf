import { describe, expect, it } from "vitest";
import sqlCsvConverter from "./sql-csv";

describe("sql-csv", () => {
  it("INSERT ifadelerini CSV'ye çevirir", async () => {
    const encoder = new TextEncoder();
    const sql = `INSERT INTO "kisiler" ("ad", "yas") VALUES ('Ayşe', '29'), ('Mehmet', '34');`;

    const outputs = await sqlCsvConverter.run(
      { files: [{ name: "kisiler.sql", data: encoder.encode(sql).buffer }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("kisiler.csv");
    expect(outputs[0].data).toContain("ad,yas");
    expect(outputs[0].data).toContain("Ayşe,29");
  });

  it("ayrıştırılabilir bir INSERT yoksa anlamlı hata verir", async () => {
    const encoder = new TextEncoder();
    await expect(
      sqlCsvConverter.run(
        { files: [{ name: "bos.sql", data: encoder.encode("SELECT 1;").buffer }] },
        {},
        { progress: () => {}, signal: new AbortController().signal },
      ),
    ).rejects.toThrow("bulunamadı");
  });
});
