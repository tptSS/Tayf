import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { ensureEmbeddableImage, guessImageMime, toArrayBuffer } from "./shared";

export type PageSize = "a4" | "letter" | "gorsele-uygun";
export type Orientation = "dikey" | "yatay";

export interface GorselPdfOptions {
  sayfaBoyutu: PageSize;
  yonlendirme: Orientation;
  kenarBosluk: number;
}

const PAGE_SIZES: Record<Exclude<PageSize, "gorsele-uygun">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export async function run(input: ConvertInput, opts: GorselPdfOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const { bytes, mimeType } = await ensureEmbeddableImage(
      file.data as ArrayBuffer,
      guessImageMime(file.name),
    );
    const image = mimeType === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    let [pageWidth, pageHeight] =
      opts.sayfaBoyutu === "gorsele-uygun"
        ? [image.width + opts.kenarBosluk * 2, image.height + opts.kenarBosluk * 2]
        : PAGE_SIZES[opts.sayfaBoyutu];

    if (opts.sayfaBoyutu !== "gorsele-uygun" && opts.yonlendirme === "yatay") {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }

    const page = doc.addPage([pageWidth, pageHeight]);
    const maxWidth = pageWidth - opts.kenarBosluk * 2;
    const maxHeight = pageHeight - opts.kenarBosluk * 2;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  ctx.progress(0.95, "Birleştiriliyor");
  const bytes = await doc.save();
  ctx.progress(1, "Tamamlandı");

  return [{ name: "gorseller.pdf", data: toArrayBuffer(bytes), mimeType: "application/pdf" }];
}

const gorselPdfConverter: Converter<GorselPdfOptions> = {
  slug: "gorsel-pdf",
  title: "Görselden PDF oluştur",
  description: "Sayfa boyutu ve kenar boşluğu seçerek görsellerden PDF oluştur.",
  category: "pdf",
  accepts: [".jpg", ".jpeg", ".png", ".webp"],
  output: "pdf",
  multiple: "merge",
  status: "ready",
  keywords: ["görsel pdf", "resimden pdf"],
  options: [
    {
      key: "sayfaBoyutu",
      type: "select",
      label: "Sayfa boyutu",
      defaultValue: "a4",
      options: [
        { value: "a4", label: "A4" },
        { value: "letter", label: "Letter" },
        { value: "gorsele-uygun", label: "Görsele uygun" },
      ],
    },
    {
      key: "yonlendirme",
      type: "select",
      label: "Yönlendirme",
      defaultValue: "dikey",
      options: [
        { value: "dikey", label: "Dikey" },
        { value: "yatay", label: "Yatay" },
      ],
    },
    { key: "kenarBosluk", type: "number", label: "Kenar boşluğu (pt)", defaultValue: 24, min: 0, max: 200 },
  ],
  run,
};

export default gorselPdfConverter;
