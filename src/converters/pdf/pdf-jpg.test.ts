import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pdfJpgConverter from "./pdf-jpg";
import { installPdfRenderStubs } from "./test-stubs";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {} as { workerSrc?: string },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: async () => ({
        getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
        render: () => ({ promise: Promise.resolve() }),
      }),
    }),
  }),
}));

beforeEach(() => installPdfRenderStubs());
afterEach(() => vi.unstubAllGlobals());

describe("pdf-jpg", () => {
  it("her sayfa için ayrı bir JPG üretir", async () => {
    const outputs = await pdfJpgConverter.run(
      { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
      { olcek: 2, kalite: 85 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs.map((o) => o.name)).toEqual(["belge-1.jpg", "belge-2.jpg"]);
    expect(outputs.every((o) => o.mimeType === "image/jpeg")).toBe(true);
  });
});
