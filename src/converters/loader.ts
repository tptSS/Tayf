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
  "gorsel-donustur": () => import("./image/gorsel-donustur"),
  "png-jpg": () => import("./image/png-jpg"),
  "jpg-png": () => import("./image/jpg-png"),
  "webp-jpg": () => import("./image/webp-jpg"),
  "svg-png": () => import("./image/svg-png"),
  "svg-jpg": () => import("./image/svg-jpg"),
  "png-ico": () => import("./image/png-ico"),
  "favicon-olustur": () => import("./image/favicon-olustur"),
  "gorsel-sikistir": () => import("./image/gorsel-sikistir"),
  "gorsel-boyutlandir": () => import("./image/gorsel-boyutlandir"),
  "pdf-birlestir": () => import("./pdf/pdf-birlestir"),
  "pdf-bol": () => import("./pdf/pdf-bol"),
  "pdf-filigran": () => import("./pdf/pdf-filigran"),
  "pdf-sayfa-numarasi": () => import("./pdf/pdf-sayfa-numarasi"),
  "pdf-jpg": () => import("./pdf/pdf-jpg"),
  "pdf-png": () => import("./pdf/pdf-png"),
  "pdf-metin": () => import("./pdf/pdf-metin"),
  "jpg-pdf": () => import("./pdf/jpg-pdf"),
  "png-pdf": () => import("./pdf/png-pdf"),
  "gorsel-pdf": () => import("./pdf/gorsel-pdf"),
};

export async function loadConverter(slug: string): Promise<Converter> {
  const loader = converterLoaders[slug];
  if (!loader) {
    throw new Error(`Bilinmeyen ya da henüz hazır olmayan araç: ${slug}`);
  }
  const mod = await loader();
  return mod.default;
}
