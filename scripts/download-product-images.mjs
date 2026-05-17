/**
 * Downloads /public/images/ascend/*.webp — dark cinematic stills.
 * Run: npm run download:product-images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "images", "ascend");

const FILES = {
  "team-studio.webp": "photo-1483985988352-763728e3685b",
  "lifestyle-golf.webp": "photo-1738748444676-113d30c9a25b",
  "lifestyle-airport.webp": "photo-1514565130933-ff0f825377de",
  "lifestyle-coastal.webp": "photo-1505142468610-359e7caed608",
  "editorial-architecture.webp": "photo-1486406146926-c627a92ad1ab",
  "brotherhood-dining.webp": "photo-1610899632923-3751bc4b427a",
  "hero-storefront.webp": "photo-1514565130933-ff0f825377de",
};

function photoUrl(id) {
  const photoId = id.startsWith("photo-") ? id : `photo-${id}`;
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1920&q=80`;
}

async function download(name, photoId) {
  const url = photoUrl(photoId);
  const res = await fetch(url, {
    headers: { "User-Agent": "AscendTheory-Asset-Sync/1.0" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`${name}: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`✓ ${name} (${buf.length} bytes)`);
}

fs.mkdirSync(outDir, { recursive: true });

let ok = 0;
for (const [name, id] of Object.entries(FILES)) {
  try {
    await download(name, id);
    ok++;
  } catch (err) {
    console.warn(`✗ ${err.message}`);
  }
}

const fallback = path.join(root, "public", "images", "fallback.webp");
const seed =
  [path.join(outDir, "team-studio.webp"), path.join(outDir, "lifestyle-airport.webp")].find(
    (p) => fs.existsSync(p),
  ) ?? null;

if (seed) {
  fs.copyFileSync(seed, fallback);
  console.log("✓ fallback.webp");
}

console.log(`Done: ${ok}/${Object.keys(FILES).length} images.`);
