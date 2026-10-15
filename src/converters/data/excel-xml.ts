import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { rowsFromExcelBytes, withExtension, xmlFromRows } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromExcelBytes(file.data as ArrayBuffer);
    const xml = await xmlFromRows(rows);
    outputs.push({ name: withExtension(file.name, "xml"), data: xml, mimeType: "application/xml" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const excelXmlConverter: Converter = {
  slug: "excel-xml",
  title: "Excel'i XML'e çevir",
  description: "Excel dosyasını XML'e çevir.",
  category: "data",
  accepts: [".xlsx", ".xls"],
  output: "xml",
  multiple: "batch",
  status: "ready",
  keywords: ["excel xml"],
  run,
};

export default excelXmlConverter;
