import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";

export interface SvgRasterOptions {
  width: number;
}

async function decodeAtWidth(bytes: ArrayBuffer, targetWidth: number) {
  // Önce doğal boyutu öğrenmek için düşük maliyetli bir ilk çözümleme,
  // sonra hedef genişliğe göre oranı koruyarak yüksek kalitede yeniden
  // çözümleme (bulanıklaşmayı önler).
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
    const bytes = await encodeBitmap(bitmap, "image/png");
    bitmap.close();
    outputs.push({ name: withExtension(file.name, "png"), data: bytes, mimeType: "image/png" });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const svgPngConverter: Converter<SvgRasterOptions> = {
  slug: "svg-png",
  title: "SVG'yi PNG'e çevir",
  description: "SVG'yi ölçek seçerek PNG'e çevir.",
  category: "image",
  accepts: [".svg"],
  output: "png",
  multiple: "batch",
  status: "ready",
  keywords: ["svg png"],
  options: [
    { key: "width", type: "number", label: "Genişlik (piksel)", defaultValue: 512, min: 16, max: 4096 },
  ],
  run,
};

export default svgPngConverter;
