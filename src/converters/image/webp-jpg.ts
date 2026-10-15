import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";
import type { QualityOption } from "./png-jpg";

async function run(input: ConvertInput, opts: QualityOption, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const bitmap = await decodeImage(file.data as ArrayBuffer, "image/webp");
    const bytes = await encodeBitmap(bitmap, "image/jpeg", opts.quality / 100);
    bitmap.close();
    outputs.push({ name: withExtension(file.name, "jpg"), data: bytes, mimeType: "image/jpeg" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const webpJpgConverter: Converter<QualityOption> = {
  slug: "webp-jpg",
  title: "WEBP'i JPG'e çevir",
  description: "WEBP görselleri JPG'e çevir.",
  category: "image",
  accepts: [".webp"],
  output: "jpg",
  multiple: "batch",
  status: "ready",
  keywords: ["webp jpg"],
  options: [
    { key: "quality", type: "range", label: "Kalite", defaultValue: 90, min: 10, max: 100, step: 5 },
  ],
  run,
};

export default webpJpgConverter;
