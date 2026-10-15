import type { EditorObject, EditorPage } from "./types";

let cachedFonts: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function loadTurkishFonts() {
  if (cachedFonts) return cachedFonts;
  const [regular, bold] = await Promise.all([
    fetch("/fonts/noto-sans-regular.woff2").then((r) => r.arrayBuffer()),
    fetch("/fonts/noto-sans-bold.woff2").then((r) => r.arrayBuffer()),
  ]);
  cachedFonts = { regular, bold };
  return cachedFonts;
}

function hexToRgbComponents(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

export async function exportEditedPdf(
  originalBytes: ArrayBuffer,
  pages: EditorPage[],
  objects: EditorObject[],
): Promise<Uint8Array> {
  const { PDFDocument, rgb, degrees } = await import("pdf-lib");
  const fontkit = (await import("@pdf-lib/fontkit")).default;

  const sourceDoc = await PDFDocument.load(originalBytes);
  const outDoc = await PDFDocument.create();
  outDoc.registerFontkit(fontkit);

  const needsFont = objects.some((o) => o.type === "text");
  let regularFont: Awaited<ReturnType<typeof outDoc.embedFont>> | null = null;
  let boldFont: Awaited<ReturnType<typeof outDoc.embedFont>> | null = null;
  if (needsFont) {
    const fonts = await loadTurkishFonts();
    regularFont = await outDoc.embedFont(fonts.regular, { subset: true });
    boldFont = await outDoc.embedFont(fonts.bold, { subset: true });
  }

  const sourceIndices = pages
    .map((p) => p.sourceIndex)
    .filter((i): i is number => i !== null);
  const copiedBySourceIndex = new Map<number, Awaited<ReturnType<typeof outDoc.copyPages>>[number]>();
  if (sourceIndices.length > 0) {
    const copied = await outDoc.copyPages(sourceDoc, sourceIndices);
    sourceIndices.forEach((sourceIndex, i) => {
      copiedBySourceIndex.set(sourceIndex, copied[i]);
    });
  }

  const imageCache = new Map<string, Awaited<ReturnType<typeof outDoc.embedPng>>>();

  for (const page of pages) {
    const pdfPage =
      page.sourceIndex !== null
        ? outDoc.addPage(copiedBySourceIndex.get(page.sourceIndex)!)
        : outDoc.addPage([page.widthPt, page.heightPt]);

    pdfPage.setRotation(degrees(page.rotation));

    const pageObjects = objects.filter((o) => o.pageId === page.id);
    for (const object of pageObjects) {
      if (object.type === "text") {
        const font = object.bold ? boldFont! : regularFont!;
        const [r, g, b] = hexToRgbComponents(object.color);
        const lines = object.text.split("\n");
        lines.forEach((line, i) => {
          pdfPage.drawText(line, {
            x: object.x,
            y: object.y - i * object.fontSize * 1.25,
            size: object.fontSize,
            font,
            color: rgb(r, g, b),
          });
        });
      } else if (object.type === "image") {
        let embedded = imageCache.get(object.id);
        if (!embedded) {
          embedded =
            object.mimeType === "image/png"
              ? await outDoc.embedPng(object.bytes)
              : await outDoc.embedJpg(object.bytes);
          imageCache.set(object.id, embedded);
        }
        pdfPage.drawImage(embedded, {
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
        });
      } else if (object.type === "shape") {
        const [strokeR, strokeG, strokeB] = hexToRgbComponents(
          object.strokeColor,
        );
        if (object.kind === "rectangle") {
          pdfPage.drawRectangle({
            x: object.x,
            y: object.y,
            width: object.width,
            height: object.height,
            borderColor: rgb(strokeR, strokeG, strokeB),
            borderWidth: object.strokeWidth,
            color: object.fillColor
              ? rgb(...hexToRgbComponents(object.fillColor))
              : undefined,
            opacity: object.fillColor ? object.fillOpacity : 0,
            borderOpacity: object.strokeWidth > 0 ? 1 : 0,
          });
        } else if (object.kind === "ellipse") {
          pdfPage.drawEllipse({
            x: object.x + object.width / 2,
            y: object.y + object.height / 2,
            xScale: object.width / 2,
            yScale: object.height / 2,
            borderColor: rgb(strokeR, strokeG, strokeB),
            borderWidth: object.strokeWidth,
            color: object.fillColor
              ? rgb(...hexToRgbComponents(object.fillColor))
              : undefined,
            opacity: object.fillColor ? object.fillOpacity : 0,
            borderOpacity: object.strokeWidth > 0 ? 1 : 0,
          });
        } else {
          pdfPage.drawLine({
            start: { x: object.x, y: object.y },
            end: { x: object.x + object.width, y: object.y + object.height },
            thickness: object.strokeWidth,
            color: rgb(strokeR, strokeG, strokeB),
          });
        }
      }
    }
  }

  return outDoc.save();
}
