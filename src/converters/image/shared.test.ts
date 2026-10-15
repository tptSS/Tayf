import { describe, expect, it } from "vitest";
import { computeResizedDimensions, withExtension } from "./shared";

describe("computeResizedDimensions", () => {
  const natural = { width: 1000, height: 500 };

  it("yalnızca genişlik verilmişse ve oran kilitliyse yüksekliği orana göre hesaplar", () => {
    expect(computeResizedDimensions(natural, { width: 400 }, true)).toEqual({
      width: 400,
      height: 200,
    });
  });

  it("yalnızca yükseklik verilmişse ve oran kilitliyse genişliği orana göre hesaplar", () => {
    expect(computeResizedDimensions(natural, { height: 100 }, true)).toEqual({
      width: 200,
      height: 100,
    });
  });

  it("oran kilidi kapalıysa verilen değerleri olduğu gibi kullanır", () => {
    expect(computeResizedDimensions(natural, { width: 400, height: 50 }, false)).toEqual({
      width: 400,
      height: 50,
    });
  });

  it("hiçbir hedef verilmemişse doğal boyutu döndürür", () => {
    expect(computeResizedDimensions(natural, {}, true)).toEqual(natural);
  });
});

describe("withExtension", () => {
  it("mevcut uzantıyı yenisiyle değiştirir", () => {
    expect(withExtension("resim.jpeg", "png")).toBe("resim.png");
  });

  it("uzantısı olmayan dosya adına yeni uzantı ekler", () => {
    expect(withExtension("resim", "png")).toBe("resim.png");
  });
});
