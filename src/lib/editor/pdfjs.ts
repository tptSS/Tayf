"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

let configured = false;

async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!configured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    configured = true;
  }
  return pdfjsLib;
}

export async function loadPdfDocument(
  bytes: ArrayBuffer,
): Promise<PDFDocumentProxy> {
  const pdfjsLib = await getPdfjs();
  // pdf.js, verilen buffer'ı transfer edip detach edebiliyor; kopyasını
  // veriyoruz ki orijinal bayt dizisi (kaydetme için saklanıyor) bozulmasın.
  const data = bytes.slice(0);
  return pdfjsLib.getDocument({ data }).promise;
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: number,
): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) return;
  await page.render({ canvas, canvasContext: context, viewport }).promise;
}
