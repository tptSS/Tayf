import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { withExtension, xmlFromRows, type Row } from "./shared";

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
    const xml = await xmlFromRows(rows);
    outputs.push({ name: withExtension(file.name, "xml"), data: xml, mimeType: "application/xml" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const jsonXmlConverter: Converter = {
  slug: "json-xml",
  title: "JSON'u XML'e çevir",
  description: "JSON dosyasını XML'e çevir.",
  category: "data",
  accepts: [".json"],
  output: "xml",
  multiple: "batch",
  status: "ready",
  keywords: ["json xml"],
  run,
};

export default jsonXmlConverter;
