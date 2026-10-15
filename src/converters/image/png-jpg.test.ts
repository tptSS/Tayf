import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pngJpgConverter from "./png-jpg";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("png-jpg", () => {
  it("PNG'yi JPG'e çevirir", async () => {
    const outputs = await pngJpgConverter.run(
      { files: [{ name: "a.png", data: new ArrayBuffer(8) }] },
      { quality: 80 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("a.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });
});
