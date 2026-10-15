import type { EditorPage } from "./types";
import { loadPdfDocument } from "./pdfjs";
import { makeId } from "./store";

export async function buildPagesFromPdf(
  bytes: ArrayBuffer,
): Promise<EditorPage[]> {
  const pdf = await loadPdfDocument(bytes);
  const pages: EditorPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    // page.view = [x0, y0, x1, y1], rotasyonsuz (intrinsic) sayfa kutusu —
    // pdf-lib'in page.getSize() ile aynı uzayda.
    const [x0, y0, x1, y1] = page.view;
    pages.push({
      id: makeId("page"),
      sourceIndex: i - 1,
      widthPt: x1 - x0,
      heightPt: y1 - y0,
      rotation: (page.rotate % 360) as 0 | 90 | 180 | 270,
    });
  }

  return pages;
}
