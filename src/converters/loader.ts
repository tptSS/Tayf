import type { Converter } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loader = () => Promise<{ default: Converter<any> }>;

/**
 * Her yüklenebilir aracın modülünü dinamik olarak çözer. Bu harita yalnızca
 * worker içinde kullanılır; ana sayfa paketine girmez. Yeni bir araç
 * eklediğinde burada tek satır eklemen yeterli.
 */
export const converterLoaders: Record<string, Loader> = {
  "csv-json": () => import("./data/csv-json"),
  "excel-csv": () => import("./data/excel-csv"),
  "csv-excel": () => import("./data/csv-excel"),
  "excel-json": () => import("./data/excel-json"),
  "json-excel": () => import("./data/json-excel"),
  "json-csv": () => import("./data/json-csv"),
  "excel-xml": () => import("./data/excel-xml"),
  "xml-excel": () => import("./data/xml-excel"),
  "json-xml": () => import("./data/json-xml"),
  "xml-json": () => import("./data/xml-json"),
  "json-yaml": () => import("./data/json-yaml"),
  "yaml-json": () => import("./data/yaml-json"),
  "csv-sql": () => import("./data/csv-sql"),
  "excel-sql": () => import("./data/excel-sql"),
  "sql-csv": () => import("./data/sql-csv"),
  "sql-excel": () => import("./data/sql-excel"),
};

export async function loadConverter(slug: string): Promise<Converter> {
  const loader = converterLoaders[slug];
  if (!loader) {
    throw new Error(`Bilinmeyen ya da henüz hazır olmayan araç: ${slug}`);
  }
  const mod = await loader();
  return mod.default;
}
