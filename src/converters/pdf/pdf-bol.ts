import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { toArrayBuffer, withoutExtension } from "./shared";

export interface BolOptions {
  mode: "her-sayfa" | "aralik";
  aralik: string;
}

function parseRanges(spec: string, pageCount: number): number[][] {
  const groups: number[][] = [];
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!match) throw new Error(`Geçersiz aralık: "${part}". Örnek: 1-3,5,7-9`);
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end > pageCount || start > end) {
      throw new Error(`Aralık sayfa sınırlarının dışında: "${part}" (1-${pageCount})`);
    }
    const indices: number[] = [];
    for (let p = start; p <= end; p++) indices.push(p - 1);
    groups.push(indices);
  }
  return groups;
}

async function run(input: ConvertInput, opts: BolOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const outputs: ConvertOutput[] = [];

  for (let f = 0; f < input.files.length; f++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[f];
    ctx.progress(f / input.files.length, file.name);

    const srcDoc = await PDFDocument.load(file.data as ArrayBuffer);
    const pageCount = srcDoc.getPageCount();
    const groups =
      opts.mode === "her-sayfa"
        ? Array.from({ length: pageCount }, (_, i) => [i])
        : parseRanges(opts.aralik, pageCount);

    for (let g = 0; g < groups.length; g++) {
      if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(srcDoc, groups[g]);
      pages.forEach((p) => outDoc.addPage(p));
      const bytes = await outDoc.save();
      const label = opts.mode === "her-sayfa" ? `sayfa-${g + 1}` : `bolum-${g + 1}`;
      outputs.push({
        name: `${withoutExtension(file.name)}-${label}.pdf`,
        data: toArrayBuffer(bytes),
        mimeType: "application/pdf",
      });
    }
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfBolConverter: Converter<BolOptions> = {
  slug: "pdf-bol",
  title: "PDF böl",
  description: "PDF'i aralığa ya da her sayfaya göre böl.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "zip",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf bölme", "pdf ayırma"],
  options: [
    {
      key: "mode",
      type: "select",
      label: "Bölme şekli",
      defaultValue: "her-sayfa",
      options: [
        { value: "her-sayfa", label: "Her sayfa ayrı dosya" },
        { value: "aralik", label: "Aralığa göre (ör. 1-3,5,7-9)" },
      ],
    },
    { key: "aralik", type: "text", label: "Aralık", defaultValue: "1-1" },
  ],
  run,
};

export default pdfBolConverter;
