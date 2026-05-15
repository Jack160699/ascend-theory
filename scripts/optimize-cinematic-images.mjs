/**
 * Re-encode `public/images/ascend/*` to WebP with Sharp.
 * Run: npm run optimize:images
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "ascend");

const MIN_BYTES = 250 * 1024;
const MAX_BYTES = 600 * 1024;

const FILES = [
  { file: "hero-storefront.png", maxLong: 3000 },
  { file: "editorial-architecture.png", maxLong: 2600 },
  { file: "brotherhood-dining.png", maxLong: 2600 },
  { file: "team-studio.png", maxLong: 2600 },
  { file: "lifestyle-golf.png", maxLong: 2600 },
  { file: "lifestyle-airport.png", maxLong: 2600 },
  { file: "lifestyle-coastal.png", maxLong: 3000 },
];

function webpOptions(quality, nearLossless) {
  return {
    quality,
    effort: 6,
    smartSubsample: false,
    alphaQuality: 100,
    nearLossless,
    lossless: false,
    chromaSubsampling: "4:4:4",
  };
}

async function encodeToTarget(inputPath, outputPath, maxLong) {
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const long = Math.max(w, h);
  const scale = long > maxLong ? maxLong / long : 1;
  const targetW = Math.round(w * scale);
  const targetH = Math.round(h * scale);

  let quality = 88;
  let nearLossless = true;
  let buf = await sharp(inputPath)
    .resize(targetW, targetH, { fit: "inside", withoutEnlargement: true })
    .webp(webpOptions(quality, nearLossless))
    .toBuffer();

  while (buf.length > MAX_BYTES && quality > 72) {
    quality -= 4;
    nearLossless = quality > 82;
    buf = await sharp(inputPath)
      .resize(targetW, targetH, { fit: "inside", withoutEnlargement: true })
      .webp(webpOptions(quality, nearLossless))
      .toBuffer();
  }

  if (buf.length < MIN_BYTES && quality < 95) {
    quality = Math.min(95, quality + 6);
    buf = await sharp(inputPath)
      .resize(targetW, targetH, { fit: "inside", withoutEnlargement: true })
      .webp(webpOptions(quality, true))
      .toBuffer();
  }

  const tmp = `${outputPath}.tmp`;
  await fs.writeFile(tmp, buf);
  await fs.rename(tmp, outputPath);
  return buf.length;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const { file, maxLong } of FILES) {
    const inputPath = path.join(OUT_DIR, file);
    const base = file.replace(/\.(png|jpe?g)$/i, "");
    const outputPath = path.join(OUT_DIR, `${base}.webp`);
    try {
      await fs.access(inputPath);
    } catch {
      console.warn(`skip (missing): ${file}`);
      continue;
    }
    const bytes = await encodeToTarget(inputPath, outputPath, maxLong);
    console.log(`${base}.webp — ${(bytes / 1024).toFixed(0)} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
