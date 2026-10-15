import { vi } from "vitest";

/**
 * jsdom, OffscreenCanvas/createImageBitmap'i uygulamaz. Bu sahte sürümler,
 * görsel dönüştürücülerin orkestrasyon mantığını (dosya adlandırma, çoklu
 * dosya, iptal, mimeType seçimi) gerçek piksel kod çözme/kodlama olmadan
 * test etmeyi sağlar — piksel düzeyinde doğruluk bu testlerle doğrulanmaz,
 * gerçek bir tarayıcıda manuel kontrol gerekir.
 */
export function installCanvasStubs() {
  class FakeOffscreenCanvas {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return { drawImage: () => {} };
    }
    convertToBlob(opts?: { type?: string }) {
      return Promise.resolve(
        new Blob([new Uint8Array([1, 2, 3, 4])], { type: opts?.type ?? "image/png" }),
      );
    }
  }

  vi.stubGlobal("OffscreenCanvas", FakeOffscreenCanvas);
  vi.stubGlobal(
    "createImageBitmap",
    async (
      _source: unknown,
      options?: { resizeWidth?: number; resizeHeight?: number },
    ) => ({
      width: options?.resizeWidth ?? 200,
      height: options?.resizeHeight ?? 100,
      close() {},
    }),
  );
}
