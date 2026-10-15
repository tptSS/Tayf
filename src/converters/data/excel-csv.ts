import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { csvTextFromRows, rowsFromExcelBytes, withExtension } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromExcelBytes(file.data as ArrayBuffer);
    const csv = await csvTextFromRows(rows);
    outputs.push({ name: withExtension(file.name, "csv"), data: csv, mimeType: "text/csv" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const excelCsvConverter: Converter = {
  slug: "excel-csv",
  title: "Excel'i CSV'ye çevir",
  description: "Excel dosyasını CSV'ye çevir.",
  category: "data",
  accepts: [".xlsx", ".xls", ".ods"],
  output: "csv",
  multiple: "batch",
  status: "ready",
  keywords: ["excel csv"],
  run,
};

export default excelCsvConverter;
