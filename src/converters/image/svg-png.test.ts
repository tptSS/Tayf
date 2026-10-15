import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import svgPngConverter from "./svg-png";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("svg-png", () => {
  it("SVG'yi istenen genişlikte PNG'e çevirir", async () => {
    const outputs = await svgPngConverter.run(
      { files: [{ name: "logo.svg", data: new ArrayBuffer(8) }] },
      { width: 256 },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("logo.png");
    expect(outputs[0].mimeType).toBe("image/png");
  });
});
