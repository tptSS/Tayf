import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import pdfBirlestirConverter from "./pdf-birlestir";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 300]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("pdf-birlestir", () => {
  it("birden çok PDF'i tek dosyada, tüm sayfalarıyla birleştirir", async () => {
    const a = await makePdf(2);
    const b = await makePdf(3);

    const outputs = await pdfBirlestirConverter.run(
      { files: [{ name: "a.pdf", data: a }, { name: "b.pdf", data: b }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("birlestirilmis.pdf");
    const merged = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    expect(merged.getPageCount()).toBe(5);
  });

  it("iptal edildiğinde AbortError fırlatır", async () => {
    const controller = new AbortController();
    controller.abort();
    const a = await makePdf(1);
    await expect(
      pdfBirlestirConverter.run(
        { files: [{ name: "a.pdf", data: a }] },
        {},
        { progress: () => {}, signal: controller.signal },
      ),
    ).rejects.toThrow("İptal edildi");
  });
});
