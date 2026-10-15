import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { csvTextFromRows, withExtension } from "./shared";
import { parseInsertStatements } from "./sql-dialect";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = parseInsertStatements(decoder.decode(file.data as ArrayBuffer));
    if (rows.length === 0) {
      throw new Error(`${file.name}: İçinde ayrıştırılabilir bir INSERT ifadesi bulunamadı.`);
    }
    const csv = await csvTextFromRows(rows);
    outputs.push({ name: withExtension(file.name, "csv"), data: csv, mimeType: "text/csv" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const sqlCsvConverter: Converter = {
  slug: "sql-csv",
  title: "SQL'i CSV'ye çevir",
  description: "INSERT ifadelerini CSV tablosuna çevir.",
  category: "data",
  accepts: [".sql"],
  output: "csv",
  multiple: "batch",
  status: "ready",
  keywords: ["sql csv"],
  run,
};

export default sqlCsvConverter;
