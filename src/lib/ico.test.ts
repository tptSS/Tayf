import { describe, expect, it } from "vitest";
import { packIco } from "./ico";

describe("packIco", () => {
  it("doğru ICO başlığını ve giriş sayısını yazar", () => {
    const png16 = new Uint8Array([1, 2, 3]);
    const png32 = new Uint8Array([4, 5, 6, 7]);
    const ico = packIco([
      { width: 16, height: 16, png: png16 },
      { width: 32, height: 32, png: png32 },
    ]);
    const view = new DataView(ico.buffer);

    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type: icon
    expect(view.getUint16(4, true)).toBe(2); // image count
  });

  it("görsel verilerini doğru ofsetlere yerleştirir", () => {
    const png1 = new Uint8Array([9, 9, 9]);
    const png2 = new Uint8Array([7, 7]);
    const ico = packIco([
      { width: 16, height: 16, png: png1 },
      { width: 16, height: 16, png: png2 },
    ]);

    const headerSize = 6;
    const entrySize = 16;
    const dataStart = headerSize + entrySize * 2;

    expect(Array.from(ico.slice(dataStart, dataStart + 3))).toEqual([9, 9, 9]);
    expect(Array.from(ico.slice(dataStart + 3, dataStart + 5))).toEqual([7, 7]);
  });

  it("256 pikselin üzerindeki boyutları 0 olarak kodlar (ICO formatı gereği)", () => {
    const ico = packIco([{ width: 256, height: 256, png: new Uint8Array([1]) }]);
    expect(ico[6]).toBe(0); // width byte
    expect(ico[7]).toBe(0); // height byte
  });
});
