import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import gorselDonusturConverter from "./gorsel-donustur";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("gorsel-donustur", () => {
  it("dosya adını ve mimeType'ı hedef formata göre ayarlar", async () => {
    const outputs = await gorselDonusturConverter.run(
      { files: [{ name: "foto.png", data: new ArrayBuffer(8) }] },
      { format: "image/jpeg", quality: 80 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs).toHaveLength(1);
    expect(outputs[0].name).toBe("foto.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });

  it("birden çok dosyayı sırayla işler (batch)", async () => {
    const outputs = await gorselDonusturConverter.run(
      {
        files: [
          { name: "a.png", data: new ArrayBuffer(8) },
          { name: "b.jpg", data: new ArrayBuffer(8) },
        ],
      },
      { format: "image/webp", quality: 90 },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(outputs.map((o) => o.name)).toEqual(["a.webp", "b.webp"]);
  });

  it("iptal edildiğinde AbortError fırlatır", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      gorselDonusturConverter.run(
        { files: [{ name: "a.png", data: new ArrayBuffer(8) }] },
        { format: "image/png", quality: 90 },
        { progress: () => {}, signal: controller.signal },
      ),
    ).rejects.toThrow("İptal edildi");
  });
});
