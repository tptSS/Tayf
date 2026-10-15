import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { rowsFromXmlText, withExtension } from "./shared";

export interface PrettyOption {
  pretty: boolean;
}

async function run(input: ConvertInput, opts: PrettyOption, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const rows = await rowsFromXmlText(decoder.decode(file.data as ArrayBuffer));
    outputs.push({
      name: withExtension(file.name, "json"),
      data: JSON.stringify(rows, null, opts.pretty ? 2 : 0),
      mimeType: "application/json",
    });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const xmlJsonConverter: Converter<PrettyOption> = {
  slug: "xml-json",
  title: "XML'i JSON'a çevir",
  description: "XML dosyasını JSON'a çevir.",
  category: "data",
  accepts: [".xml"],
  output: "json",
  multiple: "batch",
  status: "ready",
  keywords: ["xml json"],
  options: [
    { key: "pretty", type: "toggle", label: "Okunabilir biçimle (girintili)", defaultValue: true },
  ],
  run,
};

export default xmlJsonConverter;
