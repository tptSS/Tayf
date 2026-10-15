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
};

export async function loadConverter(slug: string): Promise<Converter> {
  const loader = converterLoaders[slug];
  if (!loader) {
    throw new Error(`Bilinmeyen ya da henüz hazır olmayan araç: ${slug}`);
  }
  const mod = await loader();
  return mod.default;
}
