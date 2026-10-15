import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";

export interface QualityOption {
  quality: number;
}

async function run(input: ConvertInput, opts: QualityOption, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const bitmap = await decodeImage(file.data as ArrayBuffer, "image/png");
    const bytes = await encodeBitmap(bitmap, "image/jpeg", opts.quality / 100);
    bitmap.close();
    outputs.push({ name: withExtension(file.name, "jpg"), data: bytes, mimeType: "image/jpeg" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pngJpgConverter: Converter<QualityOption> = {
  slug: "png-jpg",
  title: "PNG'yi JPG'e çevir",
  description: "PNG görselleri JPG'e çevir.",
  category: "image",
  accepts: [".png"],
  output: "jpg",
  multiple: "batch",
  status: "ready",
  keywords: ["png jpg"],
  options: [
    { key: "quality", type: "range", label: "Kalite", defaultValue: 90, min: 10, max: 100, step: 5 },
  ],
  run,
};

export default pngJpgConverter;
