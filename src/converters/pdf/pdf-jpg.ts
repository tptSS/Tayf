import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { loadPdfJsDocument, renderPdfPageToBytes, withoutExtension } from "./shared";

export interface PdfJpgOptions {
  olcek: number;
  kalite: number;
}

async function run(input: ConvertInput, opts: PdfJpgOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];

  for (let f = 0; f < input.files.length; f++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[f];
    ctx.progress(f / input.files.length, file.name);

    const pdf = await loadPdfJsDocument(file.data as ArrayBuffer);
    for (let p = 1; p <= pdf.numPages; p++) {
      if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
      const bytes = await renderPdfPageToBytes(pdf, p, opts.olcek, "image/jpeg", opts.kalite / 100);
      outputs.push({
        name: `${withoutExtension(file.name)}-${p}.jpg`,
        data: bytes,
        mimeType: "image/jpeg",
      });
    }
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfJpgConverter: Converter<PdfJpgOptions> = {
  slug: "pdf-jpg",
  title: "PDF'i JPG'e çevir",
  description: "PDF sayfalarını JPG görsellere çevir.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "zip",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf jpg", "pdf görsel"],
  options: [
    { key: "olcek", type: "range", label: "Çözünürlük ölçeği", defaultValue: 2, min: 1, max: 4, step: 0.5 },
    { key: "kalite", type: "range", label: "JPG kalitesi", defaultValue: 85, min: 10, max: 100, step: 5 },
  ],
  run,
};

export default pdfJpgConverter;
