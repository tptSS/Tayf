import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";

export interface SikistirOptions {
  quality: number;
}

function guessMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

async function run(input: ConvertInput, opts: SikistirOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const mimeType = guessMime(file.name);
    const bitmap = await decodeImage(file.data as ArrayBuffer, mimeType);
    // PNG kayıpsızdır; sıkıştırma kaydırıcısı asıl JPG/WEBP'te etkilidir.
    // PNG girişte, daha küçük çıktı almak için JPG'e çeviriyoruz.
    const targetMime = mimeType === "image/png" ? "image/jpeg" : (mimeType as "image/jpeg" | "image/webp");
    const bytes = await encodeBitmap(bitmap, targetMime, opts.quality / 100);
    bitmap.close();
    const ext = targetMime === "image/jpeg" ? "jpg" : "webp";
    outputs.push({ name: withExtension(file.name, ext), data: bytes, mimeType: targetMime });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const gorselSikistirConverter: Converter<SikistirOptions> = {
  slug: "gorsel-sikistir",
  title: "Görsel sıkıştır",
  description: "Kalite kaydırıcısıyla görsel boyutunu azalt.",
  category: "image",
  accepts: [".png", ".jpg", ".jpeg", ".webp"],
  output: "jpg",
  multiple: "batch",
  status: "ready",
  keywords: ["görsel sıkıştırma", "resim boyutu küçült"],
  options: [
    {
      key: "quality",
      type: "range",
      label: "Kalite",
      defaultValue: 70,
      min: 10,
      max: 100,
      step: 5,
      help: "PNG girişler, daha küçük boyut için JPG'e çevrilir.",
    },
  ],
  run,
};

export default gorselSikistirConverter;
