import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import gorselBoyutlandirConverter from "./gorsel-boyutlandir";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("gorsel-boyutlandir", () => {
  it("dosya adını ve türünü korur", async () => {
    const outputs = await gorselBoyutlandirConverter.run(
      { files: [{ name: "foto.png", data: new ArrayBuffer(8) }] },
      { width: 400, height: 300, lockAspectRatio: true },
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("foto.png");
    expect(outputs[0].mimeType).toBe("image/png");
  });
});
