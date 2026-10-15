import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import faviconOlusturConverter from "./favicon-olustur";
import { installCanvasStubs } from "./test-stubs";

beforeEach(() => installCanvasStubs());
afterEach(() => vi.unstubAllGlobals());

describe("favicon-olustur", () => {
  it("favicon.ico, PNG boyutları, manifest ve HTML etiketlerini üretir", async () => {
    const outputs = await faviconOlusturConverter.run(
      { files: [{ name: "logo.png", data: new ArrayBuffer(8) }] },
      {},
      { progress: () => {}, signal: new AbortController().signal },
    );

    const names = outputs.map((o) => o.name);
    expect(names).toEqual([
      "favicon.ico",
      "icon-192.png",
      "icon-512.png",
      "apple-touch-icon.png",
      "site.webmanifest",
      "head-etiketleri.html",
    ]);

    const manifest = JSON.parse(
      outputs.find((o) => o.name === "site.webmanifest")!.data as string,
    );
    expect(manifest.icons).toHaveLength(2);
  });
});
