# Tayf — Proje Brief'i

Tayf, ücretsiz ve tamamen tarayıcıda çalışan bir **PDF düzenleyici ve dosya dönüştürücüdür.** Kullanıcı bir dosyayı bırakır, istediği formata dönüştürür ya da düzenler, sonucu indirir. Dosyalar **hiçbir zaman sunucuya yüklenmez.**

Hedef kitle: arkadaşlar, şirket içi kullanıcılar ve genel kullanıcılar. Ticari değil, reklam yok, üyelik yok.
Arayüz dili: **yalnızca Türkçe.**

---

## 1. Temel ilkeler (pazarlık konusu değil)

1. **Sunucu yok.** Tüm işlemler tarayıcıda yapılır (JavaScript + WebAssembly). API route, server action, veritabanı yok.
2. **Dosya ağa çıkmaz.** Hiçbir kullanıcı dosyası `fetch`/XHR ile gönderilmez. Analytics bile dosya adı içermez.
3. **Statik site.** Next.js `output: 'export'`, Vercel Hobby planında barındırılır.
4. **Arayüz donmaz.** Her ağır işlem Web Worker içinde çalışır (Comlink ile).
5. **Tembel yükleme.** Bir aracın WASM/kütüphanesi yalnızca o araç açıldığında indirilir. Ana sayfa hafif kalır.
6. **PWA.** Service worker ile kütüphaneler önbelleğe alınır, site çevrimdışı çalışır, iPhone'da ana ekrana eklenebilir.
7. **Genişletilebilirlik.** Yeni bir dönüştürücü eklemek tek bir modül dosyası yazmak demektir (bkz. Bölüm 4).

---

## 2. Marka

### İsim
- **Tayf** (logoda ve wordmark'ta küçük harf: `tayf`)
- Anlamı: ışık tayfı. Tek dosya girer, istenen formata ayrılır.
- Slogan önerisi: "Dosyan, istediğin biçimde." / "Dosyaların bilgisayarından çıkmaz."

### Renkler

| Rol | Renk | Hex |
|---|---|---|
| Mürekkep (koyu zemin, metin) | Ink | `#0E1116` |
| Kırık beyaz (açık zemin) | Paper | `#F4F5F7` |
| Kategori: PDF | Kızıl | `#FF5A36` |
| Kategori: Görsel | Amber | `#FFB020` |
| Kategori: Veri | Yeşil | `#22C493` |
| Kategori: Belge + ana vurgu (butonlar, linkler, odak halkası) | Mavi | `#3D7BFF` |

Kurallar:
- Spektrum **yalnızca bu dört renktir.** Mor/pembe eklenmez.
- Dört renk **asla yatay şeritler halinde alt alta dizilmez** (bayrak çağrışımı). Birlikte göründükleri tek yer logo yelpazesidir.
- Kategori renkleri küçük alanlarda kullanılır: araç ikon kutusu, etiket, ince vurgu. Büyük renkli zeminler yok.
- Arayüzün geri kalanı nötr (ink/paper tonları). Gölge ve gradyan minimum.
- Açık ve koyu mod ikisi de birinci sınıf. Sistem tercihine uyar, elle değiştirilebilir.
- Tüm metin/zemin kombinasyonları WCAG AA kontrastını geçmeli. Kategori renkli zeminlerin üzerinde metin gerekiyorsa koyu ink kullanılır (sarı/yeşil üzerinde beyaz kullanılmaz).

### Tipografi
- **Geist Sans** (arayüz), **Geist Mono** (kod, SQL/JSON önizleme). `next/font` ile yüklenir, Türkçe karakter desteği kontrol edilir.
- Başlıklarda hafif negatif harf aralığı (`tracking-tight`).

### Logo
Yuvarlatılmış kare (radius ≈ %25), ink zemin. Soldan beyaz kısa bir çubuk girer, bir noktadan sağa doğru dört çizgi halinde yelpaze gibi açılır (yukarıdan aşağı: kızıl, amber, yeşil, mavi).

Referans SVG:

```svg
<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <rect width="56" height="56" rx="14" fill="#0E1116"/>
  <rect x="10" y="25" width="16" height="6" rx="3" fill="#F4F5F7"/>
  <path d="M26 28 L46 14" stroke="#FF5A36" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L47 23" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L47 33" stroke="#22C493" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L46 42" stroke="#3D7BFF" stroke-width="4" stroke-linecap="round"/>
</svg>
```

Gerekli çıktılar: `favicon.ico` (16/32/48), `icon.svg`, `apple-touch-icon.png` (180), PWA ikonları (192, 512, maskable), Open Graph görseli (1200×630).

### Yazım dili (UX metinleri)
- Sade, samimi, "sen" diliyle Türkçe. Cümle düzeninde büyük harf ("Dosya seç", "Dosya Seç" değil).
- Buton: fiil ile başlar, 1–3 kelime ("Dönüştür", "PDF olarak indir").
- Hata: ne olduğunu ve ne yapılacağını söyler ("Bu dosya şifreli. Şifreyi girip tekrar dene.").
- "Başarıyla", "lütfen", "tıklayın" gibi dolgu kelimeler yok.

---

## 3. Teknoloji

Tek dil: **TypeScript (strict).** Paket sürümlerini kurulum sırasında güncel olarak doğrula, sabit sürüm uydurma.

| Alan | Seçim |
|---|---|
| Çatı | Next.js (App Router, `output: 'export'`) |
| Stil | Tailwind CSS + shadcn/ui |
| Animasyon | Motion (Framer Motion) — `prefers-reduced-motion`'a uy |
| İkonlar | lucide-react |
| Durum | Zustand (özellikle PDF düzenleyici) |
| Worker | Web Worker + Comlink |
| Zip | fflate |
| PWA | Serwist (veya eşdeğeri, statik export ile uyumlu olan) |
| Test | Vitest (dönüştürücü birim testleri) + Playwright (uçtan uca) |

### Dönüşüm kütüphaneleri

| İş | Kütüphane |
|---|---|
| PDF görüntüleme, metin çıkarma, sayfa → görsel | `pdfjs-dist` |
| PDF oluşturma/düzenleme | `pdf-lib` + `@pdf-lib/fontkit` (Türkçe için gömülü TTF, ör. Noto Sans / Geist) |
| PDF sıkıştırma, şifreleme, onarma | qpdf'in WASM derlemesi (güncel ve bakımı yapılan paketi araştır) |
| OCR | `tesseract.js` (`tur` + `eng` dil verisi) |
| Excel/ODS okuma-yazma | SheetJS (`xlsx`) — **npm'deki eski sürümü değil**, cdn.sheetjs.com'daki güncel tarball'ı kur |
| CSV | `papaparse` |
| XML | `fast-xml-parser` |
| YAML | `js-yaml` |
| Word → HTML/metin | `mammoth` |
| Word (.docx) oluşturma | `docx` |
| Markdown | `marked` (+ `turndown` HTML → Markdown) |
| SVG rasterleştirme | `@resvg/resvg-wasm` |
| PNG/JPG/WEBP/AVIF kodlama | `@jsquash/*` (kalite ayarlı); basit durumlarda `OffscreenCanvas` |
| HEIC okuma | `heic2any` veya `libheif` WASM |
| ICO üretimi | Kendi küçük yazıcımız (PNG'leri ICO kapsayıcısına paketle) |

Lisans: MIT/Apache/BSD/MPL tercih edilir. AGPL bir paket gerekirse önce sor.

---

## 4. Mimari

### Klasör yapısı

```
src/
  app/
    page.tsx                  # Ana sayfa: bırakma alanı + akıllı öneri + arama + araç ızgarası
    araclar/[slug]/page.tsx   # Her araç için sayfa (generateStaticParams ile)
    duzenle/page.tsx          # PDF düzenleyici
    gizlilik/page.tsx
    hakkinda/page.tsx
  components/
    ui/                       # shadcn
    dropzone/                 # Sürükle-bırak, çoklu dosya, yapıştırma (Ctrl+V)
    tool-runner/              # Ortak araç arayüzü: dosyalar, seçenekler, ilerleme, sonuç, indir
    editor/                   # PDF düzenleyici bileşenleri
    brand/                    # Logo, wordmark
  converters/
    registry.ts               # Tüm modülleri toplar, girdi türüne göre eşleştirir
    types.ts
    pdf/  image/  data/  document/   # Her dönüştürücü bir dosya
  workers/
    convert.worker.ts         # Modülleri dinamik import eder, Comlink ile açar
  lib/
    detect.ts                 # Dosya türü tespiti (uzantı + magic bytes)
    download.ts               # Blob indirme, çoklu sonuçta ZIP
    fonts.ts
```

### Dönüştürücü modül kalıbı

Her araç bu sözleşmeyi uygular. Arayüz, seçenek formunu `options` şemasından otomatik üretir.

```ts
export type Category = 'pdf' | 'image' | 'data' | 'document';

export interface Converter<O = Record<string, unknown>> {
  slug: string;                 // 'pdf-birlestir', 'excel-sql'
  title: string;                // 'PDF birleştir'
  description: string;          // Tek cümle, SEO için de kullanılır
  category: Category;
  accepts: string[];            // ['application/pdf'] veya ['.xlsx', '.csv']
  output: string | ((opts: O) => string); // Çıktı uzantısı
  multiple: 'none' | 'batch' | 'merge'; // batch: her dosya ayrı işlenir; merge: hepsi tek çıktı
  options?: OptionField[];      // select / number / text / toggle / range
  keywords?: string[];          // Arama ve SEO ('pdf birleştirme', 'pdf ekleme')
  run(input: ConvertInput, opts: O, ctx: RunContext): Promise<ConvertOutput[]>;
}

export interface RunContext {
  progress(ratio: number, label?: string): void; // 0–1
  signal: AbortSignal;                           // İptal desteği zorunlu
}
```

`run` worker içinde çalışır, DOM'a erişmez. Kütüphaneler `run` içinde dinamik `import()` ile yüklenir.

### Akıllı öneri
Ana sayfada dosya bırakıldığında `detect.ts` türü belirler, `registry` bu türü kabul eden araçları listeler. En sık kullanılanlar öne çıkar. Kullanıcı tek tıkla araca geçer, dosya taşınır (yeniden seçmek gerekmez).

---

## 5. Araçlar

Slug'lar Türkçe ve SEO dostudur.

### PDF (kızıl)
- `pdf-duzenle` — **Düzenleyici** (ayrı sayfa, bkz. Bölüm 6)
- `pdf-birlestir`, `pdf-bol` (aralık / her sayfa / boyuta göre), `pdf-sayfa-duzenle` (sırala, sil, döndür; küçük resimlerle sürükle-bırak)
- `pdf-sikistir` (düşük/orta/yüksek), `pdf-sifrele`, `pdf-sifre-kaldir` (şifre biliniyorsa)
- `pdf-ocr` (taranmış PDF'i aranabilir yap)
- `pdf-filigran`, `pdf-sayfa-numarasi`
- `pdf-jpg`, `pdf-png` (çözünürlük seçmeli, çok sayfada ZIP)
- `pdf-metin` (.txt), `pdf-word` (temel düzen korunur, kullanıcıya "kontrol et" uyarısı)
- `jpg-pdf`, `png-pdf`, `gorsel-pdf` (sayfa boyutu, kenar boşluğu, yönlendirme)

### Görsel (amber)
- `gorsel-donustur`: PNG ↔ JPG ↔ WEBP ↔ AVIF, HEIC → JPG/PNG (kaynak/hedef seçimli tek araç + popüler eşleşmeler için ayrı SEO sayfaları: `png-jpg`, `jpg-png`, `webp-jpg`, `heic-jpg` …)
- `svg-png`, `svg-jpg` (ölçek/boyut seçmeli)
- `png-ico`, `favicon-olustur` (tüm boyutlar + `site.webmanifest` + HTML etiketleri, ZIP)
- `gorsel-sikistir` (kalite kaydırıcısı, önce/sonra karşılaştırma ve boyut kazancı)
- `gorsel-boyutlandir` (piksel/yüzde, en-boy oranı kilidi)

### Veri (yeşil)
- `excel-csv`, `csv-excel`
- `excel-json`, `json-excel`, `csv-json`, `json-csv`
- `excel-xml`, `xml-excel`, `json-xml`, `xml-json`
- `json-yaml`, `yaml-json`
- `excel-sql`, `csv-sql`: lehçe seçimi (MySQL, PostgreSQL, SQL Server, SQLite), tablo adı, sütun tipi tahmini (düzenlenebilir), `CREATE TABLE` aç/kapa, toplu INSERT boyutu, doğru kaçış (escape)
- `sql-excel`, `sql-csv`: INSERT ifadelerini tabloya çevir
- Çok sayfalı Excel'de sayfa seçimi. Büyük dosyalarda önizleme ilk 100 satır.

### Belge (mavi)
- `word-pdf` (mammoth → HTML → PDF; düzen kaybı olabileceğini belirt)
- `word-html`, `word-markdown`, `word-metin`
- `markdown-word`, `markdown-pdf`, `markdown-html`
- `html-pdf` (yapıştırılan HTML'den)

Her araç sayfası: başlık, tek cümle açıklama, bırakma alanı, seçenekler, işlem, sonuç ve önizleme, "dosyaların cihazından çıkmadı" güvencesi, ilgili araçlar.

---

## 6. PDF Düzenleyici (`/duzenle`)

- PDF.js ile sayfa render'ı (canvas), solda küçük resim şeridi, üstte araç çubuğu.
- Araçlar: seç, metin ekle (font, boyut, renk), mevcut metni değiştir (beyaz kutu + aynı konuma yeni metin; orijinal font bulunamazsa en yakın gömülü font), imza (çiz / yaz / görsel yükle), görsel ekle, şekil (dikdörtgen, elips, çizgi, ok), vurgulama, karartma (redaction: içeriği gerçekten kaldırır), form alanlarını doldur, sayfa ekle/sil/döndür/sırala.
- Nesneler taşınabilir, yeniden boyutlandırılabilir, katman sırası değişebilir.
- Geri al / ileri al (Ctrl+Z / Ctrl+Shift+Z), klavye kısayolları, yakınlaştırma.
- Koordinat dönüşümü: ekran (sol üst orijin, CSS piksel) ↔ PDF (sol alt orijin, pt). Tek bir yardımcı fonksiyonda topla, testle.
- Kaydetme: değişiklikler pdf-lib ile orijinal dosyaya uygulanır. Dokunulmayan içerik aynen korunur.
- Mobilde: dokunmatik sürükleme, alt araç çubuğu.

---

## 7. UX ve kalite gereksinimleri

- **Ana sayfa:** büyük bırakma alanı ("Dosyanı buraya bırak ya da seç"), altında araç arama (Türkçe karakter duyarsız: "birlestir" → "birleştir"), kategori filtreleri, araç ızgarası. Üstte kısa güven mesajı: dosyalar cihazdan çıkmaz.
- Çoklu dosya: liste halinde, sıralanabilir, tek tek kaldırılabilir. Toplu sonuç ZIP olarak.
- İlerleme çubuğu + iptal butonu her uzun işlemde.
- Sonuç ekranı: dosya boyutu (önce/sonra), önizleme, "İndir", "Başka bir araçla devam et" (çıktıyı yeni araca aktar).
- Boyut uyarıları: 200 MB üstü dosyalarda, özellikle iOS Safari'de, bellek uyarısı göster.
- Erişilebilirlik: tam klavye kullanımı, odak halkaları, ARIA etiketleri, ekran okuyucu ilerleme bildirimi.
- Responsive: 360 px'ten geniş ekrana kadar.
- Boş/hata durumları tasarlanmış olmalı, ham hata mesajı kullanıcıya gösterilmez.
- Performans hedefi: ana sayfa Lighthouse 95+, ilk JS yükü küçük. Dönüştürücü kodu ana pakete girmez.

---

## 8. SEO / GEO

- Her araç sayfası statik olarak üretilir: benzersiz `title` ve `description` (ör. "PDF birleştir – ücretsiz, yükleme yok | Tayf").
- `keywords` alanından Türkçe arama terimleri ("pdf birleştirme", "excel'i sql'e çevirme").
- JSON-LD: `WebApplication` + her araç için `HowTo` ve kısa `FAQPage`.
- `sitemap.xml`, `robots.txt`, kanonik URL'ler, Open Graph görselleri.
- Her araç sayfasında kısa, gerçekten faydalı bir "Nasıl kullanılır" bölümü (3 adım) ve 2–3 SSS.

---

## 9. Gizlilik

- Analytics gerekiyorsa çerezsiz ve anonim (Vercel Analytics veya Plausible). Sadece sayfa görüntülemesi ve "araç kullanıldı" olayı (dosya adı, boyut, içerik yok).
- `/gizlilik` sayfası sade Türkçe ile ne toplanmadığını açıklar.
- CSP başlıkları `vercel.json` ile.

---

## 10. Aşamalar

1. **Temel:** proje kurulumu, marka (renk token'ları, font, logo, favicon), layout, ana sayfa, bırakma alanı, araç kayıt sistemi, worker altyapısı, ortak araç arayüzü.
2. **Hızlı kazanımlar:** görsel dönüşümleri, SVG → PNG, ICO/favicon, Excel/CSV/JSON/XML/YAML, Excel/CSV → SQL.
3. **PDF araçları:** birleştir, böl, sayfa düzenle, görsel ↔ PDF, PDF → görsel/metin, filigran, sayfa numarası.
4. **Ağır WASM:** sıkıştırma, şifreleme, OCR.
5. **PDF düzenleyici.**
6. **Belge dönüşümleri:** Word/Markdown/HTML.
7. **Cila:** PWA, SEO, erişilebilirlik denetimi, Playwright testleri, Vercel'e yayın.

Her aşama sonunda: `npm run build` (statik export) hatasız, testler yeşil, mobil ve masaüstünde manuel kontrol.

---

## 11. Çalışma kuralları (Claude Code için)

- Bir dönüştürücü eklerken: modül + `fixtures/` altında örnek dosya + Vitest testi. Testsiz dönüştürücü yok.
- Yeni bağımlılık eklemeden önce paket boyutunu ve lisansını kontrol et.
- Kullanıcıya görünen her metin Türkçe ve Bölüm 2'deki yazım kurallarına uygun.
- Dosya içeriğini asla `console.log`'a basma.
- Emin olmadığın bir kütüphane davranışı varsa uydurma, belgesine bak.
