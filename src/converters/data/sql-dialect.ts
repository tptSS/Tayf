import type { Row } from "./shared";

export type SqlDialect = "mysql" | "postgresql" | "sqlserver" | "sqlite";

type ColumnType = "integer" | "real" | "text";

function quoteIdentifier(dialect: SqlDialect, name: string): string {
  switch (dialect) {
    case "mysql":
      return "`" + name.replace(/`/g, "``") + "`";
    case "sqlserver":
      return "[" + name.replace(/]/g, "]]") + "]";
    default:
      return '"' + name.replace(/"/g, '""') + '"';
  }
}

function typeName(dialect: SqlDialect, type: ColumnType): string {
  const map: Record<SqlDialect, Record<ColumnType, string>> = {
    mysql: { integer: "INT", real: "DOUBLE", text: "VARCHAR(255)" },
    postgresql: { integer: "INTEGER", real: "DOUBLE PRECISION", text: "TEXT" },
    sqlserver: { integer: "INT", real: "FLOAT", text: "NVARCHAR(255)" },
    sqlite: { integer: "INTEGER", real: "REAL", text: "TEXT" },
  };
  return map[dialect][type];
}

function inferColumnType(values: string[]): ColumnType {
  const nonEmpty = values.filter((v) => v !== "" && v !== undefined && v !== null);
  if (nonEmpty.length === 0) return "text";
  if (nonEmpty.every((v) => /^-?\d+$/.test(v))) return "integer";
  if (nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v))) return "real";
  return "text";
}

function formatValue(value: string, type: ColumnType): string {
  if (value === "" || value === undefined || value === null) return "NULL";
  if (type === "text") return "'" + value.replace(/'/g, "''") + "'";
  return value;
}

export interface SqlGenerateOptions {
  dialect: SqlDialect;
  tableName: string;
  includeCreateTable: boolean;
  batchSize: number;
}

export function generateSql(rows: Row[], opts: SqlGenerateOptions): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const types = Object.fromEntries(
    columns.map((col) => [col, inferColumnType(rows.map((r) => r[col]))]),
  ) as Record<string, ColumnType>;

  const table = quoteIdentifier(opts.dialect, opts.tableName);
  const quotedColumns = columns.map((c) => quoteIdentifier(opts.dialect, c));
  const parts: string[] = [];

  if (opts.includeCreateTable) {
    const columnDefs = columns.map(
      (c) => `  ${quoteIdentifier(opts.dialect, c)} ${typeName(opts.dialect, types[c])}`,
    );
    parts.push(`CREATE TABLE ${table} (\n${columnDefs.join(",\n")}\n);`);
  }

  const batchSize = Math.max(1, opts.batchSize);
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const tuples = batch.map(
      (row) => "(" + columns.map((c) => formatValue(row[c], types[c])).join(", ") + ")",
    );
    parts.push(
      `INSERT INTO ${table} (${quotedColumns.join(", ")}) VALUES\n${tuples.join(",\n")};`,
    );
  }

  return parts.join("\n\n");
}

/**
 * Basit bir `INSERT INTO tablo (a, b) VALUES (...), (...);` ayrıştırıcısı.
 * Tırnaklı tanımlayıcıları (`` ` ``, `"`, `[]`) ve tek tırnaklı string
 * değerlerini (iki tek tırnakla kaçışı dahil) destekler. Rastgele SQL
 * dökümleri için değil, bu aracın kendi ürettiği ya da benzer şekilde
 * biçimlendirilmiş INSERT ifadeleri için tasarlanmıştır.
 */
export function parseInsertStatements(sql: string): Row[] {
  const rows: Row[] = [];
  const stripQuote = (s: string) => s.replace(/^["`[]|["\]`]$/g, "");

  const insertRegex = /INSERT\s+INTO\s+[\s\S]*?\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gi;
  let match: RegExpExecArray | null;

  while ((match = insertRegex.exec(sql))) {
    const columns = match[1].split(",").map((c) => stripQuote(c.trim()));
    const valuesSection = match[2];
    for (const tuple of splitTuples(valuesSection)) {
      const values = splitValues(tuple);
      const row: Row = {};
      columns.forEach((col, i) => {
        row[col] = values[i] ?? "";
      });
      rows.push(row);
    }
  }

  return rows;
}

function splitTuples(valuesSection: string): string[] {
  const tuples: string[] = [];
  let depth = 0;
  let inString = false;
  let current = "";

  for (let i = 0; i < valuesSection.length; i++) {
    const ch = valuesSection[i];
    if (ch === "'" && valuesSection[i - 1] !== "\\") inString = !inString;
    if (!inString && ch === "(") {
      if (depth === 0) current = "";
      depth++;
      if (depth === 1) continue;
    }
    if (!inString && ch === ")") {
      depth--;
      if (depth === 0) {
        tuples.push(current);
        continue;
      }
    }
    if (depth > 0) current += ch;
  }

  return tuples;
}

function splitValues(tuple: string): string[] {
  const values: string[] = [];
  let inString = false;
  let current = "";

  for (let i = 0; i < tuple.length; i++) {
    const ch = tuple[i];
    if (ch === "'") {
      if (inString && tuple[i + 1] === "'") {
        current += "'";
        i++;
        continue;
      }
      inString = !inString;
      continue;
    }
    if (ch === "," && !inString) {
      values.push(finalizeValue(current));
      current = "";
      continue;
    }
    current += ch;
  }
  values.push(finalizeValue(current));
  return values;
}

function finalizeValue(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.toUpperCase() === "NULL") return "";
  return trimmed;
}
