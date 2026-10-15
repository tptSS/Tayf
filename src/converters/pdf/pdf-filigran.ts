import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { embedTurkishFont, toArrayBuffer, withExtension } from "./shared";

export interface FiligranOptions {
  metin: string;
  boyut: number;
  saydamlik: number;
}

async function run(input: ConvertInput, opts: FiligranOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const { PDFDocument, rgb, degrees } = await import("pdf-lib");
  const outputs: ConvertOutput[] = [];

  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const doc = await PDFDocument.load(file.data as ArrayBuffer);
    const font = await embedTurkishFont(doc);
    const textWidth = font.widthOfTextAtSize(opts.metin, opts.boyut);

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(opts.metin, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        size: opts.boyut,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opts.saydamlik / 100,
        rotate: degrees(45),
      });
    }

    const bytes = await doc.save();
    outputs.push({
      name: withExtension(file.name, "pdf"),
      data: toArrayBuffer(bytes),
      mimeType: "application/pdf",
    });
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfFiligranConverter: Converter<FiligranOptions> = {
  slug: "pdf-filigran",
  title: "PDF filigran ekle",
  description: "PDF sayfalarına çapraz metin filigranı ekle.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "pdf",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf filigran", "pdf watermark"],
  options: [
    { key: "metin", type: "text", label: "Filigran metni", defaultValue: "TASLAK" },
    { key: "boyut", type: "number", label: "Yazı boyutu", defaultValue: 48, min: 8, max: 200 },
    { key: "saydamlik", type: "range", label: "Saydamlık (%)", defaultValue: 30, min: 5, max: 100, step: 5 },
  ],
  run,
};

export default pdfFiligranConverter;
