export interface EmbeddableImage {
  bytes: ArrayBuffer;
  mimeType: "image/png" | "image/jpeg";
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * pdf-lib yalnızca PNG ve JPEG gömebiliyor. Başka bir formatsa (webp, gif,
 * svg...) canvas üzerinden PNG'ye çevirir.
 */
export async function loadEmbeddableImage(file: File): Promise<EmbeddableImage> {
  const bitmap = await createImageBitmap(file);
  const canDirectlyEmbed = file.type === "image/png" || file.type === "image/jpeg";

  if (canDirectlyEmbed) {
    const bytes = await file.arrayBuffer();
    return {
      bytes,
      mimeType: file.type as "image/png" | "image/jpeg",
      previewUrl: URL.createObjectURL(file),
      naturalWidth: bitmap.width,
      naturalHeight: bitmap.height,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi.");
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Görsel PNG'e çevrilemedi.");

  return {
    bytes: await blob.arrayBuffer(),
    mimeType: "image/png",
    previewUrl: URL.createObjectURL(blob),
    naturalWidth: bitmap.width,
    naturalHeight: bitmap.height,
  };
}
