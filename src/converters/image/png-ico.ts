import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap, withExtension } from "./shared";
import { packIco } from "@/lib/ico";

const ICO_SIZES = [16, 32, 48];

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const images = await Promise.all(
      ICO_SIZES.map(async (size) => {
        const bitmap = await decodeImage(file.data as ArrayBuffer, "image/png", {
          width: size,
          height: size,
        });
        const bytes = await encodeBitmap(bitmap, "image/png");
        bitmap.close();
        return { width: size, height: size, png: new Uint8Array(bytes) };
      }),
    );

    const ico = packIco(images);
    outputs.push({
      name: withExtension(file.name, "ico"),
      data: ico.buffer as ArrayBuffer,
      mimeType: "image/x-icon",
    });
  }
  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pngIcoConverter: Converter = {
  slug: "png-ico",
  title: "PNG'yi ICO'ya çevir",
  description: "PNG görseli favicon formatına (.ico) çevir.",
  category: "image",
  accepts: [".png"],
  output: "ico",
  multiple: "batch",
  status: "ready",
  keywords: ["png ico", "favicon"],
  run,
};

export default pngIcoConverter;
