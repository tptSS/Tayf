import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import gorselPdfConverter from "./gorsel-pdf";

async function makePng(width: number, height: number): Promise<ArrayBuffer> {
  const buf = await sharp({
    create: { width, height, channels: 4, background: { r: 200, g: 50, b: 50, alpha: 1 } },
  })
    .png()
    .toBuffer();
  const out = new Uint8Array(buf.length);
  out.set(buf);
  return out.buffer;
}

describe("gorsel-pdf", () => {
  it("her görseli ayrı bir A4 sayfasına, ortalayarak yerleştirir", async () => {
    const png = await makePng(100, 50);
    const outputs = await gorselPdfConverter.run(
      { files: [{ name: "a.png", data: png }, { name: "b.png", data: png }] },
      { sayfaBoyutu: "a4", yonlendirme: "dikey", kenarBosluk: 24 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("gorseller.pdf");
    const doc = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    expect(doc.getPageCount()).toBe(2);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBeCloseTo(595.28, 0);
    expect(height).toBeCloseTo(841.89, 0);
  });

  it("'görsele uygun' seçiliyse sayfa boyutu görsel + kenar boşluğuna eşitlenir", async () => {
    const png = await makePng(100, 50);
    const outputs = await gorselPdfConverter.run(
      { files: [{ name: "a.png", data: png }] },
      { sayfaBoyutu: "gorsele-uygun", yonlendirme: "dikey", kenarBosluk: 10 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    const doc = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBe(120);
    expect(height).toBe(70);
  });

  it("yatay yönlendirmede genişlik/yüksekliği takas eder", async () => {
    const png = await makePng(100, 50);
    const outputs = await gorselPdfConverter.run(
      { files: [{ name: "a.png", data: png }] },
      { sayfaBoyutu: "a4", yonlendirme: "yatay", kenarBosluk: 24 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    const doc = await PDFDocument.load(outputs[0].data as ArrayBuffer);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBeGreaterThan(height);
  });
});
