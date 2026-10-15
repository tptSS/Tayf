import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { loadPdfJsDocument, withExtension } from "./shared";

interface TextItem {
  str: string;
  hasEOL?: boolean;
}

async function run(input: ConvertInput, _opts: unknown, ctx: RunContext): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];

  for (let f = 0; f < input.files.length; f++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[f];
    ctx.progress(f / input.files.length, file.name);

    const pdf = await loadPdfJsDocument(file.data as ArrayBuffer);
    const pageTexts: string[] = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let current = "";
      for (const item of content.items as TextItem[]) {
        current += item.str;
        if (item.hasEOL) {
          lines.push(current);
          current = "";
        }
      }
      if (current) lines.push(current);
      pageTexts.push(lines.join("\n"));
    }

    outputs.push({
      name: withExtension(file.name, "txt"),
      data: pageTexts.join("\n\n"),
      mimeType: "text/plain",
    });
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfMetinConverter: Converter = {
  slug: "pdf-metin",
  title: "PDF'ten metin çıkar",
  description: "PDF içeriğini düz metin (.txt) olarak çıkar.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "txt",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf metin", "pdf txt"],
  run,
};

export default pdfMetinConverter;
