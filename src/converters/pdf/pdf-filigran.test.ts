import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import pdfFiligranConverter from "./pdf-filigran";
import { stubFontFetch } from "./test-font";

beforeEach(() => stubFontFetch());
afterEach(() => vi.unstubAllGlobals());

async function makePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([400, 600]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("pdf-filigran", () => {
  it("her sayfaya Türkçe karakter içeren bir filigran ekler", async () => {
    const pdf = await makePdf();
    const outputs = await pdfFiligranConverter.run(
      { files: [{ name: "belge.pdf", data: pdf }] },
      { metin: "GİZLİ", boyut: 40, saydamlik: 30 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("belge.pdf");
    const result = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    expect(result.getPageCount()).toBe(1);
  });
});
