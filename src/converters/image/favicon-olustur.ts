import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { decodeImage, encodeBitmap } from "./shared";
import { packIco } from "@/lib/ico";

const ICO_SIZES = [16, 32, 48];
const PNG_SIZES = [192, 512];

function guessMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "svg") return "image/svg+xml";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "image/png";
}

async function rasterAt(bytes: ArrayBuffer, mimeType: string, size: number): Promise<ArrayBuffer> {
  const bitmap = await decodeImage(bytes, mimeType, { width: size, height: size });
  const out = await encodeBitmap(bitmap, "image/png");
  bitmap.close();
  return out;
}

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const file = input.files[0];
  if (!file) return [];
  if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
  ctx.progress(0.1, file.name);

  const mimeType = guessMime(file.name);
  const bytes = file.data as ArrayBuffer;

  const icoImages = await Promise.all(
    ICO_SIZES.map(async (size) => ({
      width: size,
      height: size,
      png: new Uint8Array(await rasterAt(bytes, mimeType, size)),
    })),
  );
  ctx.progress(0.5, "ICO oluşturuluyor");
  const ico = packIco(icoImages);

  const pngOutputs: ConvertOutput[] = await Promise.all(
    PNG_SIZES.map(async (size) => ({
      name: `icon-${size}.png`,
      data: await rasterAt(bytes, mimeType, size),
      mimeType: "image/png",
    })),
  );
  ctx.progress(0.8, "Diğer dosyalar hazırlanıyor");

  const appleTouchIcon = await rasterAt(bytes, mimeType, 180);

  const manifest = JSON.stringify(
    {
      name: "Site",
      short_name: "Site",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      start_url: "/",
      display: "standalone",
    },
    null,
    2,
  );

  const htmlSnippet = [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join("\n");

  ctx.progress(1, "Tamamlandı");

  return [
    { name: "favicon.ico", data: ico.buffer as ArrayBuffer, mimeType: "image/x-icon" },
    ...pngOutputs,
    { name: "apple-touch-icon.png", data: appleTouchIcon, mimeType: "image/png" },
    { name: "site.webmanifest", data: manifest, mimeType: "application/json" },
    { name: "head-etiketleri.html", data: htmlSnippet, mimeType: "text/html" },
  ];
}

const faviconOlusturConverter: Converter = {
  slug: "favicon-olustur",
  title: "Favicon oluştur",
  description: "Tüm boyutlarda favicon, site.webmanifest ve HTML etiketleri oluştur.",
  category: "image",
  accepts: [".png", ".jpg", ".jpeg", ".svg"],
  output: "zip",
  multiple: "none",
  status: "ready",
  keywords: ["favicon oluşturucu"],
  run,
};

export default faviconOlusturConverter;
