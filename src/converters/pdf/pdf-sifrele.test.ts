import { describe, expect, it, vi } from "vitest";
import pdfSifreleConverter from "./pdf-sifrele";

// Gerçek qpdf WASM modülünü Vitest/Node'da çalıştırmak pratik değil
// (Emscripten'in Node ve tarayıcı dalları farklı dosya yükleme mekanizması
// kullanıyor). callMain'i çağıran argümanları ve FS akışını doğrulayan
// sahte bir modülle değiştiriyoruz — qpdf'in kendi şifreleme mantığı
// değil, pdf-sifrele'nin ONU NASIL ÇAĞIRDIĞI test ediliyor.
const callMain = vi.fn((args: string[]) => {
  expect(args).toEqual(["--encrypt", "gizli123", "gizli123", "256", "--", expect.any(String), expect.any(String)]);
  return 0;
});

vi.mock("@neslinesli93/qpdf-wasm", () => ({
  default: async () => ({
    FS: {
      writeFile: vi.fn(),
      readFile: vi.fn(() => new Uint8Array([1, 2, 3])),
      unlink: vi.fn(),
    },
    callMain,
  }),
}));

describe("pdf-sifrele", () => {
  it("qpdf'i doğru şifreleme argümanlarıyla çağırır", async () => {
    const outputs = await pdfSifreleConverter.run(
      { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
      { sifre: "gizli123" },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(callMain).toHaveBeenCalled();
    expect(outputs[0].name).toBe("belge.pdf");
    expect(outputs[0].mimeType).toBe("application/pdf");
  });

  it("kısa şifre için anlamlı hata verir", async () => {
    await expect(
      pdfSifreleConverter.run(
        { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
        { sifre: "ab" },
        { progress: () => {}, signal: new AbortController().signal },
      ),
    ).rejects.toThrow("en az 4 karakter");
  });
});
