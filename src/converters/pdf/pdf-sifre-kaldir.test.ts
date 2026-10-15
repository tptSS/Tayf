import { describe, expect, it, vi } from "vitest";
import pdfSifreKaldirConverter from "./pdf-sifre-kaldir";

const callMain = vi.fn((args: string[]) => {
  expect(args).toEqual(["--password=gizli123", "--decrypt", expect.any(String), expect.any(String)]);
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

describe("pdf-sifre-kaldir", () => {
  it("qpdf'i doğru şifre kaldırma argümanlarıyla çağırır", async () => {
    const outputs = await pdfSifreKaldirConverter.run(
      { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
      { sifre: "gizli123" },
      { progress: () => {}, signal: new AbortController().signal },
    );

    expect(callMain).toHaveBeenCalled();
    expect(outputs[0].name).toBe("belge.pdf");
  });

  it("şifre girilmemişse anlamlı hata verir", async () => {
    await expect(
      pdfSifreKaldirConverter.run(
        { files: [{ name: "belge.pdf", data: new ArrayBuffer(8) }] },
        { sifre: "" },
        { progress: () => {}, signal: new AbortController().signal },
      ),
    ).rejects.toThrow("Şifreyi gir");
  });
});
