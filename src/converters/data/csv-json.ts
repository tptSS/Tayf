import type { Converter, ConvertInput, ConvertOutput, RunContext } from "../types";

export interface CsvJsonOptions {
  delimiter: "auto" | "," | ";" | "\t";
  pretty: boolean;
}

function withJsonExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") + ".json";
}

export async function convertCsvFileToJson(
  text: string,
  opts: CsvJsonOptions,
): Promise<string> {
  const Papa = (await import("papaparse")).default;
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: opts.delimiter === "auto" ? "" : opts.delimiter,
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    throw new Error(`CSV okunamadı (satır ${first.row ?? "?"}): ${first.message}`);
  }

  return JSON.stringify(result.data, null, opts.pretty ? 2 : 0);
}

async function run(
  input: ConvertInput,
  opts: CsvJsonOptions,
  ctx: RunContext,
): Promise<ConvertOutput[]> {
  const outputs: ConvertOutput[] = [];
  const decoder = new TextDecoder("utf-8");

  for (let i = 0; i < input.files.length; i++) {
    if (ctx.signal.aborted) throw new DOMException("İptal edildi", "AbortError");

    const file = input.files[i];
    ctx.progress(i / input.files.length, file.name);

    const text = decoder.decode(file.data);
    const json = await convertCsvFileToJson(text, opts);

    outputs.push({
      name: withJsonExtension(file.name),
      data: json,
      mimeType: "application/json",
    });
  }

  ctx.progress(1, "Tamamlandı");
  return outputs;
}

const csvJsonConverter: Converter<CsvJsonOptions> = {
  slug: "csv-json",
  title: "CSV'yi JSON'a çevir",
  description: "CSV dosyasını JSON dizisine çevir.",
  category: "data",
  accepts: [".csv"],
  output: "json",
  multiple: "batch",
  status: "ready",
  keywords: ["csv json", "csv'den json'a"],
  options: [
    {
      key: "delimiter",
      type: "select",
      label: "Ayırıcı",
      defaultValue: "auto",
      options: [
        { value: "auto", label: "Otomatik algıla" },
        { value: ",", label: "Virgül (,)" },
        { value: ";", label: "Noktalı virgül (;)" },
        { value: "\t", label: "Sekme" },
      ],
    },
    {
      key: "pretty",
      type: "toggle",
      label: "Okunabilir biçimle (girintili)",
      defaultValue: true,
    },
  ],
  run,
};

export default csvJsonConverter;
