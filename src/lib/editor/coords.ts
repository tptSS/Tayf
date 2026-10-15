/**
 * Ekran (CSS piksel, sol üst köşe orijinli, Y aşağı artar, sayfanın o anki
 * rotasyonuyla render edilmiş hali) ile PDF içerik uzayı (punto/pt, sol ALT
 * köşe orijinli, Y yukarı artar, HER ZAMAN rotation=0 kabul edilen orijinal
 * sayfa kutusu — pdf-lib'in `page.getSize()` ile verdiğiyle aynı) arasındaki
 * tek dönüşüm noktası. Düzenleyicideki her bileşen konum/boyut hesaplarken
 * yalnızca bu fonksiyonları kullanır; sayfa döndürüldüğünde nesne
 * koordinatları değişmez, yalnızca ekranda nasıl göründükleri değişir.
 */
export type Rotation = 0 | 90 | 180 | 270;

export interface PageMetrics {
  /** Sayfanın döndürülmemiş (rotation=0) genişliği, pt cinsinden. */
  widthPt: number;
  /** Sayfanın döndürülmemiş (rotation=0) yüksekliği, pt cinsinden. */
  heightPt: number;
  /** 1 pt kaç CSS pikseline karşılık geliyor. */
  scale: number;
  /** Sayfanın o anki görüntüleme rotasyonu. */
  rotation: Rotation;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Render edilmiş (rotasyon uygulanmış) sayfanın pt cinsinden boyutu. */
export function getRenderedSizePt(metrics: PageMetrics): Size {
  const swapped = metrics.rotation === 90 || metrics.rotation === 270;
  return swapped
    ? { width: metrics.heightPt, height: metrics.widthPt }
    : { width: metrics.widthPt, height: metrics.heightPt };
}

export function screenToPdfPoint(point: Point, metrics: PageMetrics): Point {
  const rx = point.x / metrics.scale;
  const ry = point.y / metrics.scale;
  const { widthPt: w, heightPt: h } = metrics;

  switch (metrics.rotation) {
    case 0:
      return { x: rx, y: h - ry };
    case 90:
      return { x: ry, y: rx };
    case 180:
      return { x: w - rx, y: ry };
    case 270:
      return { x: w - ry, y: h - rx };
  }
}

export function pdfToScreenPoint(point: Point, metrics: PageMetrics): Point {
  const { x: cx, y: cy } = point;
  const { widthPt: w, heightPt: h } = metrics;
  let dx: number;
  let dy: number;

  switch (metrics.rotation) {
    case 0:
      dx = cx;
      dy = h - cy;
      break;
    case 90:
      dx = cy;
      dy = cx;
      break;
    case 180:
      dx = w - cx;
      dy = cy;
      break;
    case 270:
      dx = h - cy;
      dy = w - cx;
      break;
  }

  return { x: dx * metrics.scale, y: dy * metrics.scale };
}

export function screenToPdfSize(size: Size, metrics: PageMetrics): Size {
  return {
    width: size.width / metrics.scale,
    height: size.height / metrics.scale,
  };
}

export function pdfToScreenSize(size: Size, metrics: PageMetrics): Size {
  return {
    width: size.width * metrics.scale,
    height: size.height * metrics.scale,
  };
}

export interface PdfBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * PDF içerik uzayındaki eksenlere-hizalı bir kutuyu (ör. bir nesnenin
 * x/y/width/height'ı) ekrandaki sol-üst köşe + boyuta çevirir. Dört köşeyi
 * ayrı ayrı `pdfToScreenPoint` ile çevirip min/max alır, böylece 90/270
 * rotasyonda hangi içerik köşesinin ekranda "sol üst" olduğu önemsizleşir —
 * sonuç her zaman doğru ekran dikdörtgenidir.
 */
export function pdfBoxToScreenBox(box: PdfBox, metrics: PageMetrics): ScreenBox {
  const corners = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x, y: box.y + box.height },
    { x: box.x + box.width, y: box.y + box.height },
  ].map((p) => pdfToScreenPoint(p, metrics));

  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    left,
    top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
  };
}

/**
 * Ekranda sol-üst köşesi + boyutu bilinen bir kutuyu (ör. sürükleyerek
 * oluşturulan bir görsel/dikdörtgen nesnesi) PDF içerik uzayındaki
 * eksenlere-hizalı kutuya çevirir. İki köşeyi ayrı ayrı `screenToPdfPoint`
 * ile çevirip min/max alarak her rotasyonda doğru sonucu verir —
 * `page.drawImage`/`page.drawRectangle` (x,y) sol-alt köşeyi bekler.
 */
export function screenBoxToPdfBox(
  topLeft: Point,
  sizePx: Size,
  metrics: PageMetrics,
): PdfBox {
  const a = screenToPdfPoint(topLeft, metrics);
  const b = screenToPdfPoint(
    { x: topLeft.x + sizePx.width, y: topLeft.y + sizePx.height },
    metrics,
  );
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}
