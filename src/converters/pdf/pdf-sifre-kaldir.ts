import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { toArrayBuffer, withExtension } from "./shared";
import { runQpdf } from "./qpdf";

export interface SifreKaldirOptions {
  sifre: string;
}

async function run(
  input: ConvertInput,
  opts: SifreKaldirOptions,
  ctx: RunContext,
): Promise<ConvertOutput[]> {
  if (!opts.sifre) {
    throw new Error("Şifreyi gir.");
  }

  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const bytes = await runQpdf(
      (inPath, outPath) => [`--password=${opts.sifre}`, "--decrypt", inPath, outPath],
      file.data as ArrayBuffer,
      `${file.name}: Şifre kaldırılamadı. Şifre yanlış olabilir.`,
    );

    outputs.push({
      name: withExtension(file.name, "pdf"),
      data: toArrayBuffer(bytes),
      mimeType: "application/pdf",
    });
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const pdfSifreKaldirConverter: Converter<SifreKaldirOptions> = {
  slug: "pdf-sifre-kaldir",
  title: "PDF şifre kaldır",
  description: "Şifresi bilinen PDF'ten parolayı kaldır.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "pdf",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf şifre kaldırma", "pdf parola kaldır"],
  options: [{ key: "sifre", type: "password", label: "Mevcut şifre", defaultValue: "" }],
  run,
};

export default pdfSifreKaldirConverter;
