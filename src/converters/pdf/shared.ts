export function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

export function withExtension(name: string, extension: string): string {
  return name.replace(/\.[^./\\]+$/, "") + "." + extension;
}

export function withoutExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, "");
}

export function guessImageMime(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/png";
  }
}

/** pdf-lib yalnızca PNG/JPEG gömebilir; başka formatları canvas ile PNG'e çevirir. */
export async function ensureEmbeddableImage(
  bytes: ArrayBuffer,
  mimeType: string,
): Promise<{ bytes: ArrayBuffer; mimeType: "image/png" | "image/jpeg" }> {
  if (mimeType === "image/png" || mimeType === "image/jpeg") {
    return { bytes, mimeType };
  }
  const bitmap = await createImageBitmap(new Blob([bytes], { type: mimeType }));
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return { bytes: await blob.arrayBuffer(), mimeType: "image/png" };
}

/** Bir PDF sayfasını belirtilen ölçekte rasterleştirip PNG/JPEG baytı döndürür. */
export async function renderPdfPageToBytes(
  pdf: import("pdfjs-dist").PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  mimeType: "image/png" | "image/jpeg",
  quality?: number,
): Promise<ArrayBuffer> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = new OffscreenCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  if (!ctx) throw new Error("Sayfa işlenemedi (canvas bağlamı oluşturulamadı).");
  await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: ctx, viewport }).promise;
  const blob = await canvas.convertToBlob({ type: mimeType, quality });
  return blob.arrayBuffer();
}

let cachedTurkishFontBytes: ArrayBuffer | null = null;

/**
 * pdf-lib'in standart fontları (WinAnsi) Türkçe'ye özgü karakterleri
 * (ğ, ş, ı, ö, ü, İ) desteklemiyor. Metin ekleyen tüm PDF araçları bu
 * gömülü Noto Sans fontunu kullanır. CLAUDE.md Bölüm 3: "PDF oluşturma/
 * düzenleme: pdf-lib + @pdf-lib/fontkit (Türkçe için gömülü TTF)."
 */
export async function embedTurkishFont(
  doc: import("pdf-lib").PDFDocument,
): Promise<import("pdf-lib").PDFFont> {
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  doc.registerFontkit(fontkit);
  if (!cachedTurkishFontBytes) {
    cachedTurkishFontBytes = await fetch("/fonts/noto-sans-regular.woff2").then((r) =>
      r.arrayBuffer(),
    );
  }
  return doc.embedFont(cachedTurkishFontBytes!, { subset: true });
}

export async function loadPdfJsDocument(bytes: ArrayBuffer) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
}
