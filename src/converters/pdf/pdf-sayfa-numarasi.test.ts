import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import pdfSayfaNumarasiConverter from "./pdf-sayfa-numarasi";
import { stubFontFetch } from "./test-font";

beforeEach(() => stubFontFetch());
afterEach(() => vi.unstubAllGlobals());

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("pdf-sayfa-numarasi", () => {
  it("her sayfaya artan numara ekler, çıktı sayfa sayısını korur", async () => {
    const pdf = await makePdf(3);
    const outputs = await pdfSayfaNumarasiConverter.run(
      { files: [{ name: "belge.pdf", data: pdf }] },
      { konum: "alt-orta", baslangic: 1, boyut: 11 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    const result = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    expect(result.getPageCount()).toBe(3);
  });
});
