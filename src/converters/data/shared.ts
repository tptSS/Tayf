export type Row = Record<string, string>;

export async function rowsFromCsvText(
  text: string,
  delimiter: "auto" | "," | ";" | "\t" = "auto",
): Promise<Row[]> {
  const Papa = (await import("papaparse")).default;
  const result = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: delimiter === "auto" ? "" : delimiter,
  });
  if (result.errors.length > 0) {
    const first = result.errors[0];
    throw new Error(`CSV okunamadı (satır ${first.row ?? "?"}): ${first.message}`);
  }
  return result.data;
}

export async function csvTextFromRows(rows: Row[]): Promise<string> {
  const Papa = (await import("papaparse")).default;
  return Papa.unparse(rows);
}

export async function rowsFromExcelBytes(bytes: ArrayBuffer): Promise<Row[]> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(bytes, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: false });
}

export async function excelBytesFromRows(
  rows: Row[],
  sheetName = "Sayfa1",
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  const written = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(written);
}

export async function xmlFromRows(rows: Row[]): Promise<string> {
  const { XMLBuilder } = await import("fast-xml-parser");
  const builder = new XMLBuilder({ format: true, arrayNodeName: "satir" });
  return builder.build({ veri: { satir: rows } });
}

export async function rowsFromXmlText(text: string): Promise<Row[]> {
  const { XMLParser } = await import("fast-xml-parser");
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(text);
  const root = parsed.veri ?? parsed;
  const rows = root.satir ?? root.row ?? root;
  const list = Array.isArray(rows) ? rows : [rows];
  return list.map((row) => {
    const out: Row = {};
    for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
      out[key] = value === null || value === undefined ? "" : String(value);
    }
    return out;
  });
}

export function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

export function withExtension(name: string, extension: string): string {
  return name.replace(/\.[^./\\]+$/, "") + "." + extension;
}
