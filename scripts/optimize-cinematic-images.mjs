/**
 * Re-encode `public/images/ascend/*.webp` to real WebP with Sharp.
 * Targets ~250–600 KB while preserving texture (near-lossless + no smart subsample).
 * Paths unchanged — overwrites in place (atomic write).
 *
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

/** Long-edge cap (px). Hero gets more pixels for full-bleed. */
const FILES = [
  { file: "rooftop-sunrise.webp", maxLong: 3000 },
  { file: "library-reading.webp", maxLong: 2600 },
  { file: "brotherhood-walk.webp", maxLong: 2600 },
  { file: "planning-wall.webp", maxLong: 2600 },
  { file: "lounge-conversation.webp", maxLong: 2600 },
  { file: "rooftop-standing.webp", maxLong: 3000 },
];

function webpOptions(quality, nearLossless) {
  return {
    quality,
    effort: 6,
    smartSubsample: false,
    alphaQuality: 100,
    nearLossless,
    lossless: false,
    /** 4:4:4 reduces chroma ringing in gradients vs default subsampling */
    chromaSubsampling: "4:4:4",
  };
}

async function toBuffer(pipeline, quality, nearLossless) {
  return pipeline
    .clone()
    .webp(webpOptions(quality, nearLossless))
    .toBuffer();
}

async function buildPipeline(absPath, maxLong) {
  const pipeline = sharp(absPath, {
    limitInputPixels: false,
    failOn: "warning",
  }).rotate();

  const meta = await pipeline.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error(`No dimensions: ${absPath}`);

  const longEdge = Math.max(w, h);
  if (longEdge <= maxLong) return pipeline;

  return pipeline.resize({
    width: w >= h ? maxLong : Math.round((maxLong * w) / h),
    height: h > w ? maxLong : Math.round((maxLong * h) / w),
    fit: "inside",
    withoutEnlargement: true,
    kernel: sharp.kernel.lanczos3,
  });
}

/** Largest quality in [lo, hi] such that encoded size <= maxBytes (monotone ~). */
async function maxQualityUnder(base, lo, hi, maxBytes, nearLossless) {
  let best = lo;
  let bestBuf = await toBuffer(base, lo, nearLossless);
  for (let q = lo; q <= hi; q++) {
    const buf = await toBuffer(base, q, nearLossless);
    if (buf.length <= maxBytes) {
      best = q;
      bestBuf = buf;
    } else {
      break;
    }
  }
  return { quality: best, buffer: bestBuf };
}

async function optimizeInBand(base) {
  let { quality, buffer } = await maxQualityUnder(base, 70, 96, MAX_BYTES, true);

  if (buffer.length < MIN_BYTES) {
    const step = await maxQualityUnder(base, quality, 100, MAX_BYTES, true);
    quality = step.quality;
    buffer = step.buffer;
  }

  if (buffer.length < MIN_BYTES) {
    const step = await maxQualityUnder(base, 85, 100, MAX_BYTES, false);
    if (step.buffer.length > buffer.length) {
      quality = step.quality;
      buffer = step.buffer;
    }
  }

  if (buffer.length > MAX_BYTES) {
    const step = await maxQualityUnder(base, 60, quality, MAX_BYTES, false);
    quality = step.quality;
    buffer = step.buffer;
  }

  return { quality, buffer };
}

async function writeAtomic(dest, buffer) {
  const tmp = `${dest}.tmp.${process.pid}`;
  await fs.writeFile(tmp, buffer);
  try {
    await fs.unlink(dest);
  } catch {
    /* ignore */
  }
  await fs.rename(tmp, dest);
}

async function main() {
  console.log("Optimizing cinematic WebP assets…\n");

  for (const { file, maxLong } of FILES) {
    const abs = path.join(OUT_DIR, file);
    try {
      await fs.access(abs);
    } catch {
      console.warn(`Skip (missing): ${file}`);
      continue;
    }

    const base = await buildPipeline(abs, maxLong);
    const meta = await sharp(abs).metadata();
    const { quality, buffer } = await optimizeInBand(base);
    await writeAtomic(abs, buffer);

    const kb = (buffer.length / 1024).toFixed(1);
    const inBand =
      buffer.length >= MIN_BYTES && buffer.length <= MAX_BYTES ? "✓" : "~";
    console.log(
      `${inBand} ${file}  →  ${kb} KB  (q≈${quality}, max edge ${maxLong}px, was ${meta.format} ${meta.width}×${meta.height})`,
    );
  }

  console.log("\nDone. Restart dev server if running.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
