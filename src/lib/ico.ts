/**
 * Birden çok PNG'yi tek bir .ico kapsayıcısına paketler. Hem build-time
 * ikon üretim scriptinde (scripts/generate-icons.ts) hem de tarayıcıdaki
 * `png-ico`/`favicon-olustur` araçlarında kullanılır — bu yüzden yalnızca
 * `Uint8Array`/`DataView` kullanır, Node'un `Buffer`'ına bağımlı değildir.
 * CLAUDE.md: "ICO üretimi: Kendi küçük yazıcımız (PNG'leri ICO kapsayıcısına
 * paketle)."
 */
export interface IcoImage {
  width: number;
  height: number;
  png: Uint8Array;
}

export function packIco(images: IcoImage[]): Uint8Array {
  const headerSize = 6;
  const entrySize = 16;
  const dataOffsetStart = headerSize + entrySize * images.length;
  const totalSize =
    dataOffsetStart + images.reduce((sum, img) => sum + img.png.length, 0);

  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);

  let offset = dataOffsetStart;
  images.forEach((image, i) => {
    const entryOffset = headerSize + i * entrySize;
    view.setUint8(entryOffset + 0, image.width >= 256 ? 0 : image.width);
    view.setUint8(entryOffset + 1, image.height >= 256 ? 0 : image.height);
    view.setUint8(entryOffset + 2, 0); // color palette
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, image.png.length, true);
    view.setUint32(entryOffset + 12, offset, true);

    out.set(image.png, offset);
    offset += image.png.length;
  });

  return out;
}
