import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { packIco } from "../src/lib/ico";

const publicDir = path.resolve(import.meta.dirname, "../public");

const GLYPH = `
  <rect x="10" y="25" width="16" height="6" rx="3" fill="#F4F5F7"/>
  <path d="M26 28 L46 14" stroke="#FF5A36" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L47 23" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L47 33" stroke="#22C493" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 28 L46 42" stroke="#3D7BFF" stroke-width="4" stroke-linecap="round"/>
`;

function iconSvg(radius: number): string {
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <rect width="56" height="56" rx="${radius}" fill="#0E1116"/>
  ${GLYPH}
</svg>`;
}

async function rasterize(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await mkdir(path.join(publicDir, "icons"), { recursive: true });

  // icon.svg — standart, köşeleri yuvarlatılmış.
  await writeFile(path.join(publicDir, "icon.svg"), iconSvg(14));

  // favicon.ico — 16/32/48
  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      width: size,
      height: size,
      png: await rasterize(iconSvg(14), size),
    })),
  );
  await writeFile(path.join(publicDir, "favicon.ico"), packIco(icoImages));

  // apple-touch-icon.png — 180, köşeler iOS tarafından zaten yuvarlanır.
  await writeFile(
    path.join(publicDir, "apple-touch-icon.png"),
    await rasterize(iconSvg(0), 180),
  );

  // PWA ikonları — 192/512, standart + maskable (tam kenara kadar zemin).
  await writeFile(
    path.join(publicDir, "icons", "icon-192.png"),
    await rasterize(iconSvg(14), 192),
  );
  await writeFile(
    path.join(publicDir, "icons", "icon-512.png"),
    await rasterize(iconSvg(14), 512),
  );
  await writeFile(
    path.join(publicDir, "icons", "icon-maskable-192.png"),
    await rasterize(iconSvg(0), 192),
  );
  await writeFile(
    path.join(publicDir, "icons", "icon-maskable-512.png"),
    await rasterize(iconSvg(0), 512),
  );

  // Open Graph görseli — 1200x630, ink zemin + logo + wordmark.
  const ogSvg = `<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0E1116"/>
    <g transform="translate(420, 225)">
      <rect width="180" height="180" rx="40" fill="#0E1116"/>
      <g transform="scale(3.214)">${GLYPH}</g>
    </g>
    <text x="600" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="72" fill="#F4F5F7">tayf</text>
    <text x="600" y="515" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#9AA1AD">Dosyan, istediğin biçimde.</text>
  </svg>`;
  await writeFile(
    path.join(publicDir, "og.png"),
    await sharp(Buffer.from(ogSvg), { density: 192 })
      .resize(1200, 630)
      .png()
      .toBuffer(),
  );

  console.log("İkonlar üretildi: public/icon.svg, favicon.ico, apple-touch-icon.png, icons/*.png, og.png");
}

main();
