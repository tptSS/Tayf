import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";
import { toArrayBuffer, withExtension } from "./shared";
import { runQpdf } from "./qpdf";

export interface SifreleOptions {
  sifre: string;
}

async function run(input: ConvertInput, opts: SifreleOptions, ctx: RunContext): Promise<ConvertOutput[]> {
  if (!opts.sifre || opts.sifre.length < 4) {
    throw new Error("Şifre en az 4 karakter olmalı.");
  }

  const outputs: ConvertOutput[] = [];
  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");
    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const bytes = await runQpdf(
      (inPath, outPath) => ["--encrypt", opts.sifre, opts.sifre, "256", "--", inPath, outPath],
      file.data as ArrayBuffer,
      `${file.name}: Şifrelenemedi. PDF zaten şifreli ya da bozuk olabilir.`,
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

const pdfSifreleConverter: Converter<SifreleOptions> = {
  slug: "pdf-sifrele",
  title: "PDF şifrele",
  description: "PDF'e açma şifresi ekle.",
  category: "pdf",
  accepts: ["application/pdf", ".pdf"],
  output: "pdf",
  multiple: "batch",
  status: "ready",
  keywords: ["pdf şifrele", "pdf parola"],
  options: [{ key: "sifre", type: "password", label: "Şifre", defaultValue: "" }],
  run,
};

export default pdfSifreleConverter;
