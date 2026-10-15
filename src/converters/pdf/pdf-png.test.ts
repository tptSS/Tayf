import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pdfPngConverter from "./pdf-png";
import { installPdfRenderStubs } from "./test-stubs";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {} as { workerSrc?: string },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
        render: () => ({ promise: Promise.resolve() }),
      }),
    }),
  }),
}));

beforeEach(() => installPdfRenderStubs());
afterEach(() => vi.unstubAllGlobals());

describe("pdf-png", () => {
  it("tek sayfalık PDF'i bir PNG'e çevirir", async () => {
    const outputs = await pdfPngConverter.run(
      { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
      { olcek: 2 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("belge-1.png");
    expect(outputs[0].mimeType).toBe("image/png");
  });
});
