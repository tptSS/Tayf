# tayf

Ücretsiz, tamamen tarayıcıda çalışan PDF düzenleyici ve dosya dönüştürücü.

Bir dosya bırakırsın, istediğin formata çevirir ya da düzenlersin, sonucu
indirirsin. **Dosyalar hiçbir zaman sunucuya yüklenmez** — tüm işlemler
JavaScript ve WebAssembly ile senin tarayıcında çalışır.

Projenin tüm mimari ve ürün kararları [`CLAUDE.md`](./CLAUDE.md) dosyasında
yazılıdır; yeni bir şey eklemeden önce oraya bak.

## Nasıl çalıştırılır

Node.js 20+ gerekir.

```bash
npm install
npm run dev       # http://localhost:3000
```

Diğer komutlar:

```bash
npm run build     # statik export (out/ klasörü)
npm start         # export edilmiş build'i önizler (next start)
npm test          # Vitest birim testleri
npm run test:watch
npm run lint
npm run icons      # public/ altındaki favicon, PWA ikonları ve OG görselini
                    # logo SVG'sinden yeniden üretir (scripts/generate-icons.ts)
```

`npm run build`, `next.config.ts`'teki `output: 'export'` ayarı sayesinde
tamamen statik bir `out/` klasörü üretir; bu klasör herhangi bir statik
barındırma servisine (Vercel dahil) olduğu gibi yüklenebilir.

## Mimari (özet)

```
src/
  app/                       # Next.js App Router sayfaları
    page.tsx                 # Ana sayfa: bırakma alanı, arama, araç ızgarası
    araclar/[slug]/page.tsx  # Her araç için statik sayfa
    gizlilik/, hakkinda/
  components/
    ui/                      # shadcn bileşenleri
    dropzone/                # Sürükle-bırak + Ctrl+V dosya seçimi
    tool-runner/              # Ortak araç arayüzü (dosya listesi, seçenekler,
                              # ilerleme, sonuç)
    brand/, layout/, tools/
  converters/
    types.ts                 # Converter sözleşmesi
    registry.ts               # Tüm araçların hafif listesi (arama/ızgara için)
    loader.ts                  # slug → modül, worker içinde dinamik import
    data/csv-json.ts          # Tek örnek, çalışan dönüştürücü
  workers/
    convert.worker.ts         # Comlink ile açılan worker; modülleri ve
                              # kütüphaneleri yalnızca çalıştırıldığında yükler
  lib/
    detect.ts                 # Uzantı + magic bytes ile dosya türü tespiti
    download.ts                # Blob indirme, çoklu sonuçta ZIP (fflate)
    use-convert-worker.ts     # Worker'ı saran React hook'u
    pending-file-store.ts      # Ana sayfadan araç sayfasına dosya taşıma
scripts/
  generate-icons.ts           # favicon/PWA/OG görsellerini SVG'den üretir
  ico-pack.ts                 # PNG'leri .ico'ya paketleyen küçük yazıcı
```

## Yeni bir dönüştürücü ekleme

1. `src/converters/<kategori>/<slug>.ts` dosyasını oluştur. `src/converters/data/csv-json.ts`
   dosyasını örnek al: metadata + `run()` fonksiyonunu tek bir `Converter`
   nesnesi olarak `default export` et. Ağır kütüphaneleri `run()` içinde
   `await import(...)` ile yükle ki ana pakete girmesin.
2. `src/converters/registry.ts` içine aracın hafif özetini ekle (aynı alanlar,
   `run` hariç) ve `status: "ready"` yap. Henüz yazılmamış bir araç için
   `status: "soon"` ile sadece bu adımı yeterli.
3. `src/converters/loader.ts` içindeki `converterLoaders` haritasına
   `slug: () => import("./<kategori>/<slug>")` satırını ekle.
4. `fixtures/` altına örnek bir dosya ve bir Vitest testi yaz
   (`src/converters/<kategori>/<slug>.test.ts`). Testsiz dönüştürücü kabul
   edilmez.
5. `npm test` ve `npm run build` hatasız geçmeli.

Araç otomatik olarak ana sayfadaki ızgarada, aramada ve
`/araclar/<slug>` sayfasında görünür; seçenek formu `options` şemasından
otomatik üretilir.

## Teknoloji

Next.js (App Router, statik export) · TypeScript (strict) · Tailwind CSS +
shadcn/ui · Zustand · Web Worker + Comlink · fflate · Vitest. Ayrıntılı liste
ve her aracın hangi kütüphaneyi kullanacağı için `CLAUDE.md` Bölüm 3'e bak.
