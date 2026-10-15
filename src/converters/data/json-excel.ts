import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { excelBytesFromRows, toArrayBuffer, withExtension, type Row } from "./shared";

function parseRows(text: string, fileName: string): Row[] {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error(`${fileName}: JSON kök öğesi bir dizi olmalı.`);
  }
  return data;
}

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = parseRows(decoder.decode(file.data as ArrayBuffer), file.name);
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

const jsonExcelConverter: Converter = {
  slug: "json-excel",
  title: "JSON'u Excel'e çevir",
  description: "JSON dosyasını Excel'e çevir.",
  category: "data",
  accepts: [".json"],
  output: "xlsx",
  multiple: "batch",
  status: "ready",
  keywords: ["json excel"],
  run,
};

export default jsonExcelConverter;
