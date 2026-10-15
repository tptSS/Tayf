import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import gorselSikistirConverter from "./gorsel-sikistir";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("gorsel-sikistir", () => {
  it("JPG girişte JPG olarak kalır", async () => {
    const outputs = await gorselSikistirConverter.run(
      { files: [{ name: "foto.jpg", data: new ArrayBuffer(8) }] },
      { quality: 60 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("foto.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });

  it("PNG girişi daha küçük boyut için JPG'e çevirir", async () => {
    const outputs = await gorselSikistirConverter.run(
      { files: [{ name: "foto.png", data: new ArrayBuffer(8) }] },
      { quality: 60 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("foto.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });
});
