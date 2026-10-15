import { describe, expect, it } from "vitest";
import {
  getRenderedSizePt,
  pdfBoxToScreenBox,
  pdfToScreenPoint,
  screenBoxToPdfBox,
  screenToPdfPoint,
  screenToPdfSize,
  pdfToScreenSize,
  type PageMetrics,
  type Rotation,
} from "./coords";

const base = { widthPt: 612, heightPt: 792, scale: 1.5 };

function metricsFor(rotation: Rotation): PageMetrics {
  return { ...base, rotation };
}

describe("coords — rotation=0", () => {
  const metrics = metricsFor(0);

  it("ekranın sol üstünü PDF'in sol altına çevirir", () => {
    expect(screenToPdfPoint({ x: 0, y: 0 }, metrics)).toEqual({
      x: 0,
      y: 792,
    });
  });

  it("ekranın sağ altını PDF'in sağ altına (0,0) yakınına çevirir", () => {
    const screenBottomRight = {
      x: base.widthPt * base.scale,
      y: base.heightPt * base.scale,
    };
    const pdfPoint = screenToPdfPoint(screenBottomRight, metrics);
    expect(pdfPoint.x).toBeCloseTo(612);
    expect(pdfPoint.y).toBeCloseTo(0);
  });

  it("boyutu ölçeğe göre dönüştürür", () => {
    expect(screenToPdfSize({ width: 150, height: 300 }, metrics)).toEqual({
      width: 100,
      height: 200,
    });
    expect(pdfToScreenSize({ width: 100, height: 200 }, metrics)).toEqual({
      width: 150,
      height: 300,
    });
  });
});

describe.each([0, 90, 180, 270] as Rotation[])(
  "coords — rotation=%i round-trip",
  (rotation) => {
    const metrics = metricsFor(rotation);

    it("screenToPdfPoint ve pdfToScreenPoint birbirinin tam tersidir", () => {
      const original = { x: 123.4, y: 56.7 };
      const roundTripped = pdfToScreenPoint(
        screenToPdfPoint(original, metrics),
        metrics,
      );
      expect(roundTripped.x).toBeCloseTo(original.x);
      expect(roundTripped.y).toBeCloseTo(original.y);
    });

    it("render edilmiş kutunun dört köşesi de sayfanın içinde kalır", () => {
      const rendered = getRenderedSizePt(metrics);
      const corners = [
        { x: 0, y: 0 },
        { x: rendered.width * metrics.scale, y: 0 },
        { x: 0, y: rendered.height * metrics.scale },
        { x: rendered.width * metrics.scale, y: rendered.height * metrics.scale },
      ];
      for (const corner of corners) {
        const p = screenToPdfPoint(corner, metrics);
        expect(p.x).toBeGreaterThanOrEqual(-0.001);
        expect(p.x).toBeLessThanOrEqual(base.widthPt + 0.001);
        expect(p.y).toBeGreaterThanOrEqual(-0.001);
        expect(p.y).toBeLessThanOrEqual(base.heightPt + 0.001);
      }
    });
  },
);

describe("coords — getRenderedSizePt", () => {
  it("0 ve 180'de boyutu değiştirmez", () => {
    expect(getRenderedSizePt(metricsFor(0))).toEqual({ width: 612, height: 792 });
    expect(getRenderedSizePt(metricsFor(180))).toEqual({ width: 612, height: 792 });
  });

  it("90 ve 270'te genişlik/yüksekliği takas eder", () => {
    expect(getRenderedSizePt(metricsFor(90))).toEqual({ width: 792, height: 612 });
    expect(getRenderedSizePt(metricsFor(270))).toEqual({ width: 792, height: 612 });
  });
});

describe("coords — screenBoxToPdfBox", () => {
  it("rotation=0'da sürükleme kutusunun sol-alt köşesini doğru hesaplar", () => {
    const metrics = metricsFor(0);
    // 50x20 piksellik bir kutu, ekranda (10,10)'dan başlıyor.
    const box = screenBoxToPdfBox({ x: 10, y: 10 }, { width: 50, height: 20 }, metrics);
    expect(box.x).toBeCloseTo(10 / 1.5);
    expect(box.y).toBeCloseTo(792 - 30 / 1.5);
    expect(box.width).toBeCloseTo(50 / 1.5);
    expect(box.height).toBeCloseTo(20 / 1.5);
  });

  it("90 derecede ekran genişlik/yüksekliği içerik ekseninde takas olarak pozitif çıkar", () => {
    const metrics = metricsFor(90);
    const box = screenBoxToPdfBox({ x: 10, y: 10 }, { width: 50, height: 20 }, metrics);
    // 90/270'te ekran X↔içerik Y, ekran Y↔içerik X eksenleri birbirine karışır.
    expect(box.width).toBeCloseTo(20 / 1.5);
    expect(box.height).toBeCloseTo(50 / 1.5);
  });
});

describe.each([0, 90, 180, 270] as Rotation[])(
  "coords — pdfBoxToScreenBox ↔ screenBoxToPdfBox round-trip (rotation=%i)",
  (rotation) => {
    const metrics = metricsFor(rotation);

    it("bir PDF kutusunu ekrana çevirip geri çevirince aynı kutuyu verir", () => {
      const pdfBox = { x: 50, y: 60, width: 120, height: 40 };
      const screenBox = pdfBoxToScreenBox(pdfBox, metrics);
      expect(screenBox.width).toBeGreaterThan(0);
      expect(screenBox.height).toBeGreaterThan(0);

      const roundTripped = screenBoxToPdfBox(
        { x: screenBox.left, y: screenBox.top },
        { width: screenBox.width, height: screenBox.height },
        metrics,
      );
      expect(roundTripped.x).toBeCloseTo(pdfBox.x);
      expect(roundTripped.y).toBeCloseTo(pdfBox.y);
      expect(roundTripped.width).toBeCloseTo(pdfBox.width);
      expect(roundTripped.height).toBeCloseTo(pdfBox.height);
    });
  },
);
