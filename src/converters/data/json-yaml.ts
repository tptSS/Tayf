import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { withExtension } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const yaml = await import("js-yaml");
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const data = JSON.parse(decoder.decode(file.data as ArrayBuffer));
    outputs.push({
      name: withExtension(file.name, "yaml"),
      data: yaml.dump(data),
      mimeType: "application/yaml",
    });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const jsonYamlConverter: Converter = {
  slug: "json-yaml",
  title: "JSON'u YAML'a çevir",
  description: "JSON dosyasını YAML'a çevir.",
  category: "data",
  accepts: [".json"],
  output: "yaml",
  multiple: "batch",
  status: "ready",
  keywords: ["json yaml"],
  run,
};

export default jsonYamlConverter;
