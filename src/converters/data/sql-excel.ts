import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { excelBytesFromRows, toArrayBuffer, withExtension } from "./shared";
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
    const bytes = await excelBytesFromRows(rows);
    outputs.push({
      name: withExtension(file.name, "xlsx"),
      data: toArrayBuffer(bytes),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const sqlExcelConverter: Converter = {
  slug: "sql-excel",
  title: "SQL'i Excel'e çevir",
  description: "INSERT ifadelerini Excel tablosuna çevir.",
  category: "data",
  accepts: [".sql"],
  output: "xlsx",
  multiple: "batch",
  status: "ready",
  keywords: ["sql excel"],
  run,
};

export default sqlExcelConverter;
