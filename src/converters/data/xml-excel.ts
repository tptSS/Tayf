import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { excelBytesFromRows, rowsFromXmlText, toArrayBuffer, withExtension } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromXmlText(decoder.decode(file.data as ArrayBuffer));
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

const xmlExcelConverter: Converter = {
  slug: "xml-excel",
  title: "XML'i Excel'e çevir",
  description: "XML dosyasını Excel'e çevir.",
  category: "data",
  accepts: [".xml"],
  output: "xlsx",
  multiple: "batch",
  status: "ready",
  keywords: ["xml excel"],
  run,
};

export default xmlExcelConverter;
