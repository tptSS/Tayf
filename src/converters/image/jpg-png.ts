import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const bitmap = await decodeImage(file.data as ArrayBuffer, "image/jpeg");
    const bytes = await encodeBitmap(bitmap, "image/png");
    bitmap.close();
    outputs.push({ name: withExtension(file.name, "png"), data: bytes, mimeType: "image/png" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const jpgPngConverter: Converter = {
  slug: "jpg-png",
  title: "JPG'yi PNG'e çevir",
  description: "JPG görselleri PNG'e çevir.",
  category: "image",
  accepts: [".jpg", ".jpeg"],
  output: "png",
  multiple: "batch",
  status: "ready",
  keywords: ["jpg png"],
  run,
};

export default jpgPngConverter;
