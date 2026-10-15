/**
 * Birden çok PNG'yi tek bir .ico kapsayıcısına paketler.
 * CLAUDE.md: "ICO üretimi: Kendi küçük yazıcımız (PNG'leri ICO kapsayıcısına
 * paketle)." Harici bir ico kütüphanesi kullanmak yerine bu küçük yazıcıyı
 * hem bu build scriptinde hem de ileride tarayıcı tarafındaki
 * `png-ico`/`favicon-olustur` araçlarında paylaşabiliriz.
 */
export interface IcoImage {
  width: number;
  height: number;
  png: Buffer;
}

export function packIco(images: IcoImage[]): Buffer {
  const headerSize = 6;
  const entrySize = 16;
  const dataOffsetStart = headerSize + entrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  let offset = dataOffsetStart;

  for (const image of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(image.width >= 256 ? 0 : image.width, 0);
    entry.writeUInt8(image.height >= 256 ? 0 : image.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(image.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += image.png.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}
