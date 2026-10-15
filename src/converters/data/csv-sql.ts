import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { rowsFromCsvText, withExtension } from "./shared";
import { generateSql, type SqlDialect } from "./sql-dialect";

export interface CsvSqlOptions {
  dialect: SqlDialect;
  tableName: string;
  includeCreateTable: boolean;
  batchSize: number;
}

async function run(input: ConvertInput, opts: CsvSqlOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromCsvText(decoder.decode(file.data as ArrayBuffer));
    const sql = generateSql(rows, opts);
    outputs.push({ name: withExtension(file.name, "sql"), data: sql, mimeType: "application/sql" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const csvSqlConverter: Converter<CsvSqlOptions> = {
  slug: "csv-sql",
  title: "CSV'yi SQL'e çevir",
  description: "CSV dosyasından CREATE TABLE ve INSERT ifadeleri üret.",
  category: "data",
  accepts: [".csv"],
  output: "sql",
  multiple: "batch",
  status: "ready",
  keywords: ["csv sql", "csv'yi sql'e çevirme"],
  options: [
    {
      key: "dialect",
      type: "select",
      label: "Lehçe",
      defaultValue: "postgresql",
      options: [
        { value: "mysql", label: "MySQL" },
        { value: "postgresql", label: "PostgreSQL" },
        { value: "sqlserver", label: "SQL Server" },
        { value: "sqlite", label: "SQLite" },
      ],
    },
    { key: "tableName", type: "text", label: "Tablo adı", defaultValue: "tablo" },
    {
      key: "includeCreateTable",
      type: "toggle",
      label: "CREATE TABLE ekle",
      defaultValue: true,
    },
    {
      key: "batchSize",
      type: "number",
      label: "Toplu INSERT boyutu",
      defaultValue: 500,
      min: 1,
      max: 5000,
    },
  ],
  run,
};

export default csvSqlConverter;
