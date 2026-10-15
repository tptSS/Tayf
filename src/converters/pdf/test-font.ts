import { vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const nodeFontBytes = readFileSync(
  path.resolve(import.meta.dirname, "../../../public/fonts/noto-sans-regular.woff2"),
);
// Node'un fs modülünden gelen Buffer, Vitest'in test realm'indeki
// ArrayBuffer ile `instanceof` eşleşmeyebiliyor; bayt değerlerini bu
// realm'in kendi Uint8Array'ine kopyalayarak garanti altına alıyoruz.
const fontBytes = new Uint8Array(nodeFontBytes.length);
fontBytes.set(nodeFontBytes);

/** embedTurkishFont()'un gerçek /fonts/noto-sans-regular.woff2 dosyasını almak için yaptığı fetch çağrısını sahteler. */
export function stubFontFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ arrayBuffer: async () => fontBytes.buffer })),
  );
}
