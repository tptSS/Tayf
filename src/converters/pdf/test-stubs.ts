import { vi } from "vitest";

/**
 * pdf.js'in page.render() çağrısı onlarca 2D context metodunu/özelliğini
 * (fillRect, save/restore, transform, clip, fillStyle, font, fillText...)
 * kullanır. jsdom bunları sağlamıyor; gerçek canvas pikseli üretmeden
 * pdf.js'in çökmeden çalışmasını sağlamak için her çağrıyı/özelliği kabul
 * eden izin verici bir sahte context döndürüyoruz. Bu, dönüştürücünün
 * orkestrasyon mantığını (dosya sayısı, adlandırma, iptal) test etmeyi
 * sağlar — piksel çıktısının doğruluğu gerçek bir tarayıcıda kontrol
 * edilmelidir.
 */
function createNoopContext(): CanvasRenderingContext2D {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, prop) {
      if (prop in target) return target[prop as string];
      return () => {};
    },
    set(target, prop, value) {
      target[prop as string] = value;
      return true;
    },
  };
  return new Proxy({}, handler) as unknown as CanvasRenderingContext2D;
}

export function installPdfRenderStubs() {
  class FakeOffscreenCanvas {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return createNoopContext();
    }
    convertToBlob(opts?: { type?: string }) {
      return Promise.resolve(
        new Blob([new Uint8Array([1, 2, 3, 4])], { type: opts?.type ?? "image/png" }),
      );
    }
  }
  vi.stubGlobal("OffscreenCanvas", FakeOffscreenCanvas);
}
