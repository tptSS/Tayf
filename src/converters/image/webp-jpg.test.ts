import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import webpJpgConverter from "./webp-jpg";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("webp-jpg", () => {
  it("WEBP'i JPG'e çevirir", async () => {
    const outputs = await webpJpgConverter.run(
      { files: [{ name: "a.webp", data: new ArrayBuffer(8) }] },
      { quality: 85 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("a.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });
});
