/**
 * Downloads optimized hero loop into public/videos/.
 * Usage: npm run download:hero-video
 */
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "videos");

/** Mixkit preview CDN — dark night traffic (~1–3MB) */
const ASSETS = [
  {
    name: "hero-intro.mp4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-night-city-traffic-1032-large.mp4",
  },
  {
    name: "hero-intro.webm",
    url: "https://assets.mixkit.co/videos/preview/mixkit-night-city-traffic-1032-large.webm",
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AscendTheory-Asset-Script/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  await pipeline(res.body, createWriteStream(dest));
}

await mkdir(outDir, { recursive: true });

let ok = 0;
for (const { name, url } of ASSETS) {
  const dest = join(outDir, name);
  process.stdout.write(`Downloading ${name}…\n`);
  try {
    await download(url, dest);
    process.stdout.write(`  ✓ ${dest}\n`);
    ok += 1;
  } catch (e) {
    console.error(`  ✗ ${name}:`, e.message);
  }
}

if (ok === 0) {
  console.error(
    "\nCould not download. Add hero-intro.webm and hero-intro.mp4 manually to public/videos/",
  );
  process.exit(1);
}
