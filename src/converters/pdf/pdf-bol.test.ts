import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import pdfBolConverter from "./pdf-bol";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 300]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("pdf-bol", () => {
  it("her-sayfa modunda her sayfayı ayrı dosyaya böler", async () => {
    const pdf = await makePdf(3);
    const outputs = await pdfBolConverter.run(
      { files: [{ name: "belge.pdf", data: pdf }] },
      { mode: "her-sayfa", aralik: "" },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs).toHaveLength(3);
    expect(outputs.map((o) => o.name)).toEqual([
      "belge-sayfa-1.pdf",
      "belge-sayfa-2.pdf",
      "belge-sayfa-3.pdf",
    ]);
  });

  it("aralık modunda belirtilen grupları ayrı dosyalara böler", async () => {
    const pdf = await makePdf(5);
    const outputs = await pdfBolConverter.run(
      { files: [{ name: "belge.pdf", data: pdf }] },
      { mode: "aralik", aralik: "1-2,4" },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs).toHaveLength(2);
    const first = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    expect(first.getPageCount()).toBe(2);
    const second = await PDFDocument.load(outputs[1].data as ArrayBuffer);
    expect(second.getPageCount()).toBe(1);
  });

  it("sayfa sınırları dışındaki aralık için anlamlı hata verir", async () => {
    const pdf = await makePdf(2);
    await expect(
      pdfBolConverter.run(
        { files: [{ name: "belge.pdf", data: pdf }] },
        { mode: "aralik", aralik: "1-5" },
        { progress: () => {}, signal: new AbortController().signal },
      ),
    ).rejects.toThrow("sınırlarının dışında");
  });
});
