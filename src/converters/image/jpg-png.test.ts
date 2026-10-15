import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jpgPngConverter from "./jpg-png";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("jpg-png", () => {
  it("JPG'yi PNG'e çevirir", async () => {
    const outputs = await jpgPngConverter.run(
      { files: [{ name: "a.jpg", data: new ArrayBuffer(8) }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("a.png");
    expect(outputs[0].mimeType).toBe("image/png");
  });
});
