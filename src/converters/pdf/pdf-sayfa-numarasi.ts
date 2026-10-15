import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { embedTurkishFont, toArrayBuffer, withExtension } from "./shared";

export type Position = "alt-orta" | "alt-sag" | "alt-sol" | "ust-orta" | "ust-sag" | "ust-sol";

export interface SayfaNumarasiOptions {
  konum: Position;
  baslangic: number;
  boyut: number;
}

function positionFor(
  konum: Position,
  width: number,
  height: number,
  textWidth: number,
  margin: number,
): { x: number; y: number } {
  const x =
    konum.endsWith("sol") ? margin : konum.endsWith("sag") ? width - textWidth - margin : width / 2 - textWidth / 2;
  const y = konum.startsWith("ust") ? height - margin : margin;
  return { x, y };
}

async function run(
  input: ConvertInput,
  opts: SayfaNumarasiOptions,
  ctx: RunContext,
): Promise<ConvertOutput[]> {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const outputs: ConvertOutput[] = [];

  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const doc = await PDFDocument.load(file.data as ArrayBuffer);
    const font = await embedTurkishFont(doc);
    const pages = doc.getPages();

    pages.forEach((page, pageIndex) => {
      const label = String(opts.baslangic + pageIndex);
      const textWidth = font.widthOfTextAtSize(label, opts.boyut);
      const { width, height } = page.getSize();
      const { x, y } = positionFor(opts.konum, width, height, textWidth, 24);
      page.drawText(label, { x, y, size: opts.boyut, font, color: rgb(0.2, 0.2, 0.2) });
    });

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

const pdfSayfaNumarasiConverter: Converter<SayfaNumarasiOptions> = {
  slug: "pdf-sayfa-numarasi",
  title: "PDF sayfa numarası ekle",
  description: "PDF sayfalarına otomatik sayfa numarası ekle.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "pdf",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf sayfa numarası"],
  options: [
    {
      key: "konum",
      type: "select",
      label: "Konum",
      defaultValue: "alt-orta",
      options: [
        { value: "alt-orta", label: "Alt orta" },
        { value: "alt-sag", label: "Alt sağ" },
        { value: "alt-sol", label: "Alt sol" },
        { value: "ust-orta", label: "Üst orta" },
        { value: "ust-sag", label: "Üst sağ" },
        { value: "ust-sol", label: "Üst sol" },
      ],
    },
    { key: "baslangic", type: "number", label: "Başlangıç numarası", defaultValue: 1, min: 0, max: 9999 },
    { key: "boyut", type: "number", label: "Yazı boyutu", defaultValue: 11, min: 6, max: 40 },
  ],
  run,
};

export default pdfSayfaNumarasiConverter;
