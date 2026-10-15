import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { loadPdfJsDocument, renderPdfPageToBytes, withoutExtension } from "./shared";

export interface PdfPngOptions {
  olcek: number;
}

async function run(input: ConvertInput, opts: PdfPngOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];

  for (let f = 0; f < input.files.length; f++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[f];
    ctx.progress(f / input.files.length, file.name);

    const pdf = await loadPdfJsDocument(file.data as ArrayBuffer);
    for (let p = 1; p <= pdf.numPages; p++) {
      if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
      const bytes = await renderPdfPageToBytes(pdf, p, opts.olcek, "image/png");
      outputs.push({
        name: `${withoutExtension(file.name)}-${p}.png`,
        data: bytes,
        mimeType: "image/png",
      });
    }
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfPngConverter: Converter<PdfPngOptions> = {
  slug: "pdf-png",
  title: "PDF'i PNG'e çevir",
  description: "PDF sayfalarını PNG görsellere çevir.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "zip",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf png", "pdf görsel"],
  options: [
    { key: "olcek", type: "range", label: "Çözünürlük ölçeği", defaultValue: 2, min: 1, max: 4, step: 0.5 },
  ],
  run,
};

export default pdfPngConverter;
