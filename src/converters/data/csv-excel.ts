import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { excelBytesFromRows, rowsFromCsvText, toArrayBuffer, withExtension } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromCsvText(decoder.decode(file.data as ArrayBuffer));
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

const csvExcelConverter: Converter = {
  slug: "csv-excel",
  title: "CSV'yi Excel'e çevir",
  description: "CSV dosyasını Excel'e çevir.",
  category: "data",
  accepts: [".csv"],
  output: "xlsx",
  multiple: "batch",
  status: "ready",
  keywords: ["csv excel"],
  run,
};

export default csvExcelConverter;
