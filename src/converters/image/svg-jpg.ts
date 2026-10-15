import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";
import type { SvgRasterOptions } from "./svg-png";

async function decodeAtWidth(bytes: ArrayBuffer, targetWidth: number) {
  const probe = await decodeImage(bytes, "image/svg+xml");
  const aspect = probe.width / probe.height || 1;
  probe.close();
  const targetHeight = Math.round(targetWidth / aspect);
  return decodeImage(bytes, "image/svg+xml", { width: targetWidth, height: targetHeight });
}

async function run(input: ConvertInput, opts: SvgRasterOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const bitmap = await decodeAtWidth(file.data as ArrayBuffer, opts.width);
    const bytes = await encodeBitmap(bitmap, "image/jpeg", 0.92);
    bitmap.close();
    outputs.push({ name: withExtension(file.name, "jpg"), data: bytes, mimeType: "image/jpeg" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const svgJpgConverter: Converter<SvgRasterOptions> = {
  slug: "svg-jpg",
  title: "SVG'yi JPG'e çevir",
  description: "SVG'yi ölçek seçerek JPG'e çevir.",
  category: "image",
  accepts: [".svg"],
  output: "jpg",
  multiple: "batch",
  status: "ready",
  keywords: ["svg jpg"],
  options: [
    { key: "width", type: "number", label: "Genişlik (piksel)", defaultValue: 512, min: 16, max: 4096 },
  ],
  run,
};

export default svgJpgConverter;
