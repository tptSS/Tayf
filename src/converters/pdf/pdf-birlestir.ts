import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { toArrayBuffer } from "./shared";

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const outDoc = await PDFDocument.create();

  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);
    const srcDoc = await PDFDocument.load(file.data as ArrayBuffer);
    const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach((p) => outDoc.addPage(p));
  }

  ctx.progress(0.95, "Birleştiriliyor");
  const bytes = await outDoc.save();
  ctx.progress(1, "Tamamlandı");

  return [{ name: "birlestirilmis.pdf", data: toArrayBuffer(bytes), mimeType: "application/pdf" }];
}

const pdfBirlestirConverter: Converter = {
  slug: "pdf-birlestir",
  title: "PDF birleştir",
  description: "Birden çok PDF'i tek dosyada birleştir.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "pdf",
  multiple: "merge",
  status: "ready",
  keywords: ["pdf birleştirme", "pdf ekleme"],
  run,
};

export default pdfBirlestirConverter;
