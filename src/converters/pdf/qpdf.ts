import type { QpdfInstance } from "@neslinesli93/qpdf-wasm";

// Paketin tip tanımı yalnızca birkaç FS metodunu kapsıyor; writeFile ve
// unlink de standart Emscripten FS API'sinin bir parçası.
type FullFS = QpdfInstance["FS"] & {
  writeFile(path: string, data: Uint8Array): void;
  unlink(path: string): void;
};

let cachedInstance: Promise<QpdfInstance> | null = null;

async function getQpdf(): Promise<QpdfInstance> {
  if (!cachedInstance) {
    cachedInstance = (async () => {
      const createModule = (await import("@neslinesli93/qpdf-wasm")).default;
      const wasmUrl = new URL(
        "@neslinesli93/qpdf-wasm/dist/qpdf.wasm",
        import.meta.url,
      ).toString();
      return createModule({ locateFile: () => wasmUrl });
    })();
  }
  return cachedInstance;
}

/**
 * qpdf CLI'sini (WASM'a derlenmiş) sanal dosya sistemi üzerinden çalıştırır.
 * CLAUDE.md Bölüm 3: "PDF sıkıştırma, şifreleme, onarma: qpdf'in WASM
 * derlemesi." Her çağrı kendi giriş/çıkış dosya adını kullanır ki eş
 * zamanlı çağrılar (aynı modül örneği paylaşıldığı için) birbirine
 * karışmasın.
 */
export async function runQpdf(
  args: (inputPath: string, outputPath: string) => string[],
  inputBytes: ArrayBuffer,
  errorHint: string,
): Promise<Uint8Array> {
  const qpdf = await getQpdf();
  const fs = qpdf.FS as FullFS;
  const id = Math.random().toString(36).slice(2);
  const inputPath = `/in-${id}.pdf`;
  const outputPath = `/out-${id}.pdf`;

  fs.writeFile(inputPath, new Uint8Array(inputBytes));
  try {
    const exitCode = qpdf.callMain(args(inputPath, outputPath));
    if (exitCode !== 0) {
      throw new Error(errorHint);
    }
    return qpdf.FS.readFile(outputPath);
  } catch (error) {
    if (error instanceof Error && error.message === errorHint) throw error;
    throw new Error(errorHint);
  } finally {
    try {
      fs.unlink(inputPath);
      fs.unlink(outputPath);
    } catch {
      // Temizlik başarısız olsa da sonucu etkilemez.
    }
  }
}
