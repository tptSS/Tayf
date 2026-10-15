import { describe, expect, it } from "vitest";
import { generateSql, parseInsertStatements } from "./sql-dialect";

const rows = [
  { ad: "Ayşe", sehir: "İstanbul", yas: "29" },
  { ad: "O'Brien", sehir: "Ankara", yas: "34" },
  { ad: "Mehmet", sehir: "", yas: "" },
];

describe("generateSql", () => {
  it("CREATE TABLE ve INSERT üretir, sütun tipini doğru tahmin eder", () => {
    const sql = generateSql(rows, {
      dialect: "postgresql",
      tableName: "kisiler",
      includeCreateTable: true,
      batchSize: 1000,
    });
    expect(sql).toContain('CREATE TABLE "kisiler"');
    expect(sql).toContain('"yas" INTEGER');
    expect(sql).toContain('"ad" TEXT');
    expect(sql).toContain("INSERT INTO \"kisiler\"");
    expect(sql).toContain("O''Brien");
    expect(sql).toContain("NULL");
  });

  it("lehçeye göre tanımlayıcı kaçışını değiştirir", () => {
    const mysql = generateSql(rows, {
      dialect: "mysql",
      tableName: "kisiler",
      includeCreateTable: false,
      batchSize: 1000,
    });
    expect(mysql).toContain("`kisiler`");

    const sqlserver = generateSql(rows, {
      dialect: "sqlserver",
      tableName: "kisiler",
      includeCreateTable: false,
      batchSize: 1000,
    });
    expect(sqlserver).toContain("[kisiler]");
  });

  it("batchSize'a göre birden çok INSERT ifadesi üretir", () => {
    const sql = generateSql(rows, {
      dialect: "sqlite",
      tableName: "t",
      includeCreateTable: false,
      batchSize: 1,
    });
    expect(sql.match(/INSERT INTO/g)).toHaveLength(3);
  });
});

describe("parseInsertStatements", () => {
  it("kendi ürettiği SQL'i geri satırlara çevirir (round-trip)", () => {
    const sql = generateSql(rows, {
      dialect: "postgresql",
      tableName: "kisiler",
      includeCreateTable: true,
      batchSize: 1000,
    });
    const parsed = parseInsertStatements(sql);
    expect(parsed).toEqual(rows);
  });

  it("MySQL backtick tanımlayıcılarıyla da çalışır", () => {
    const sql = generateSql(rows, {
      dialect: "mysql",
      tableName: "kisiler",
      includeCreateTable: false,
      batchSize: 1000,
    });
    expect(parseInsertStatements(sql)).toEqual(rows);
  });

  it("virgül içeren tırnaklı değerleri doğru ayırır", () => {
    const sql = "INSERT INTO \"t\" (\"a\", \"b\") VALUES ('x, y', '1');";
    expect(parseInsertStatements(sql)).toEqual([{ a: "x, y", b: "1" }]);
  });
});
