import type { ConvertOutput } from "@/converters/types";

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Tarayıcının indirmeyi başlatması için URL'i hemen değil, kısa bir
  // gecikmeyle serbest bırak.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toUint8Array(data: ArrayBuffer | string): Uint8Array<ArrayBuffer> {
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }
  return new Uint8Array(data.slice(0));
}

export async function downloadConvertOutputs(
  outputs: ConvertOutput[],
  zipName: string,
): Promise<void> {
  if (outputs.length === 1) {
    const [output] = outputs;
    const bytes = toUint8Array(output.data);
    triggerDownload(new Blob([bytes], { type: output.mimeType }), output.name);
    return;
  }

  const { zipSync } = await import("fflate");
  const files: Record<string, Uint8Array> = {};
  for (const output of outputs) {
    files[output.name] = toUint8Array(output.data);
  }
  const zipped = zipSync(files);
  triggerDownload(new Blob([zipped], { type: "application/zip" }), zipName);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex++;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
