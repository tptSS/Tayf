export interface ResizeTo {
  width: number;
  height: number;
}

/**
 * Bir görseli diğer tüm araçların kullandığı ortak biçime çözer.
 * `resizeTo` verilirse (ör. SVG'yi belirli bir genişlikte rasterleştirirken)
 * tarayıcı kaynağı doğrudan hedef çözünürlükte, yüksek kalitede
 * yeniden örnekler — önce doğal boyutta çözüp sonra canvas'ta ölçeklemekten
 * daha net sonuç verir.
 */
export async function decodeImage(
  bytes: ArrayBuffer,
  mimeType: string,
  resizeTo?: ResizeTo,
): Promise<ImageBitmap> {
  const blob = new Blob([bytes], { type: mimeType });
  if (resizeTo) {
    return createImageBitmap(blob, {
      resizeWidth: Math.round(resizeTo.width),
      resizeHeight: Math.round(resizeTo.height),
      resizeQuality: "high",
    });
  }
  return createImageBitmap(blob);
}

export type EncodeMimeType = "image/png" | "image/jpeg" | "image/webp";

export async function encodeBitmap(
  bitmap: ImageBitmap,
  mimeType: EncodeMimeType,
  quality?: number,
): Promise<ArrayBuffer> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi (canvas bağlamı oluşturulamadı).");
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: mimeType, quality });
  return blob.arrayBuffer();
}

export const EXTENSION_FOR_MIME: Record<EncodeMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function withExtension(name: string, extension: string): string {
  return name.replace(/\.[^./\\]+$/, "") + "." + extension;
}

/**
 * Hedef genişlik/yükseklikten, en-boy oranı kilitliyse eksik olanı doğal
 * boyuta göre tamamlayarak nihai piksel boyutunu hesaplar. Saf fonksiyon —
 * canvas/tarayıcı API'si gerektirmez, bu yüzden doğrudan test edilebilir.
 */
export function computeResizedDimensions(
  natural: ResizeTo,
  target: { width?: number; height?: number },
  lockAspectRatio: boolean,
): ResizeTo {
  const aspect = natural.width / natural.height;

  if (target.width && target.height) {
    if (!lockAspectRatio) return { width: target.width, height: target.height };
    // İkisi de verilmiş ama oran kilitliyse genişliği esas al.
    return { width: target.width, height: Math.round(target.width / aspect) };
  }
  if (target.width) {
    return {
      width: target.width,
      height: lockAspectRatio ? Math.round(target.width / aspect) : natural.height,
    };
  }
  if (target.height) {
    return {
      width: lockAspectRatio ? Math.round(target.height * aspect) : natural.width,
      height: target.height,
    };
  }
  return natural;
}
