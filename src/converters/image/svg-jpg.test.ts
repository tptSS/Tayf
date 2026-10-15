import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import svgJpgConverter from "./svg-jpg";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("svg-jpg", () => {
  it("SVG'yi istenen genişlikte JPG'e çevirir", async () => {
    const outputs = await svgJpgConverter.run(
      { files: [{ name: "logo.svg", data: new ArrayBuffer(8) }] },
      { width: 256 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("logo.jpg");
    expect(outputs[0].mimeType).toBe("image/jpeg");
  });
});
