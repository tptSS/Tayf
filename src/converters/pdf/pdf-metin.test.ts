import { describe, expect, it, vi } from "vitest";
import pdfMetinConverter from "./pdf-metin";

// pdf.js'in gerçek worker/parser makinesini jsdom'da ayağa kaldırmak
// (Worker desteği yok, import.meta.url Vitest'te http: şemasına çözülüyor)
// pratik değil. getDocument()'ı, sayfa başına denetlenebilir TextItem'lar
// döndüren sahte bir PDFDocumentProxy ile değiştiriyoruz — bu,
// pdf-metin'in KENDİ mantığını (satırlara bölme, sayfa birleştirme, dosya
// adlandırma) gerçek pdf.js ayrıştırmasına ihtiyaç duymadan test eder.
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {} as { workerSrc?: string },
  getDocument: (opts: { data: ArrayBuffer }) => ({
    promise: Promise.resolve(fakePdfFor(opts.data)),
  }),
}));

function fakePdfFor(data: ArrayBuffer) {
  const text = new TextDecoder().decode(data);
  const pages = text.split("\f"); // form feed sayfa ayıracı olarak kullanılıyor
  return {
    numPages: pages.length,
    getPage: async (n: number) => ({
      getTextContent: async () => ({
        items: pages[n - 1]
          .split("\n")
          .map((line) => ({ str: line, hasEOL: true })),
      }),
    }),
  };
}

describe("pdf-metin", () => {
  it("tek sayfalı PDF'teki satırları birleştirip .txt olarak döndürür", async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode("Merhaba Dünya\nİkinci satır").buffer;

    const outputs = await pdfMetinConverter.run(
      { files: [{ name: "belge.pdf", data }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].name).toBe("belge.txt");
    expect(outputs[0].data).toBe("Merhaba Dünya\nİkinci satır");
  });

  it("çok sayfalı PDF'te sayfaları boş satırla ayırır", async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode("Sayfa bir\fSayfa iki").buffer;

    const outputs = await pdfMetinConverter.run(
      { files: [{ name: "belge.pdf", data }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs[0].data).toBe("Sayfa bir\n\nSayfa iki");
  });
});
