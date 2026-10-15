import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import {
  decodeImage,
  encodeBitmap,
  EXTENSION_FOR_MIME,
  withExtension,
  type EncodeMimeType,
} from "./shared";

export interface GorselDonusturOptions {
  format: EncodeMimeType;
  quality: number;
}

async function run(
  input: ConvertInput,
  opts: GorselDonusturOptions,
  ctx: RunContext,
): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const bitmap = await decodeImage(file.data as ArrayBuffer, guessMime(file.name));
    const bytes = await encodeBitmap(bitmap, opts.format, opts.quality / 100);
    bitmap.close();

    outputs.push({
      name: withExtension(file.name, EXTENSION_FOR_MIME[opts.format]),
      data: bytes,
      mimeType: opts.format,
    });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

function guessMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

const gorselDonusturConverter: Converter<GorselDonusturOptions> = {
  slug: "gorsel-donustur",
  title: "Görsel dönüştür",
  description: "PNG, JPG ve WEBP arasında dönüştür.",
  category: "image",
  accepts: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"],
  output: (opts) => EXTENSION_FOR_MIME[opts.format],
  multiple: "batch",
  status: "ready",
  keywords: ["png jpg", "webp dönüştür"],
  options: [
    {
      key: "format",
      type: "select",
      label: "Hedef format",
      defaultValue: "image/png",
      options: [
        { value: "image/png", label: "PNG" },
        { value: "image/jpeg", label: "JPG" },
        { value: "image/webp", label: "WEBP" },
      ],
    },
    {
      key: "quality",
      type: "range",
      label: "Kalite",
      defaultValue: 90,
      min: 10,
      max: 100,
      step: 5,
      help: "Yalnızca JPG/WEBP için geçerli.",
    },
  ],
  run,
};

export default gorselDonusturConverter;
