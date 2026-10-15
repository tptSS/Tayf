import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pngIcoConverter from "./png-ico";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("png-ico", () => {
  it("PNG'yi .ico dosyasına çevirir", async () => {
    const outputs = await pngIcoConverter.run(
      { files: [{ name: "logo.png", data: new ArrayBuffer(8) }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );
    expect(outputs[0].name).toBe("logo.ico");
    expect(outputs[0].mimeType).toBe("image/x-icon");

    const view = new DataView(outputs[0].data as ArrayBuffer);
    expect(view.getUint16(2, true)).toBe(1); // ICO type
    expect(view.getUint16(4, true)).toBe(3); // 16/32/48 = 3 görsel
  });
});
