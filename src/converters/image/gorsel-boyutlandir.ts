import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { computeResizedDimensions, decodeImage, encodeBitmap } from "./shared";

export interface BoyutlandirOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
}

function guessMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

async function run(input: ConvertInput, opts: BoyutlandirOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const mimeType = guessMime(file.name) as "image/png" | "image/jpeg" | "image/webp";

    const probe = await decodeImage(file.data as ArrayBuffer, mimeType);
    const natural = { width: probe.width, height: probe.height };
    probe.close();

    const target = computeResizedDimensions(
      natural,
      { width: opts.width, height: opts.height },
      opts.lockAspectRatio,
    );
    const bitmap = await decodeImage(file.data as ArrayBuffer, mimeType, target);
    const bytes = await encodeBitmap(bitmap, mimeType);
    bitmap.close();

    outputs.push({ name: file.name, data: bytes, mimeType });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const gorselBoyutlandirConverter: Converter<BoyutlandirOptions> = {
  slug: "gorsel-boyutlandir",
  title: "Görsel boyutlandır",
  description: "Piksel cinsinden görseli yeniden boyutlandır.",
  category: "image",
  accepts: [".png", ".jpg", ".jpeg", ".webp"],
  output: "png",
  multiple: "batch",
  status: "ready",
  keywords: ["görsel boyutlandırma", "resim boyutu değiştir"],
  options: [
    { key: "width", type: "number", label: "Genişlik (piksel)", defaultValue: 800, min: 1, max: 8000 },
    { key: "height", type: "number", label: "Yükseklik (piksel)", defaultValue: 600, min: 1, max: 8000 },
    { key: "lockAspectRatio", type: "toggle", label: "En-boy oranını koru", defaultValue: true },
  ],
  run,
};

export default gorselBoyutlandirConverter;
