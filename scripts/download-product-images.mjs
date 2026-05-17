/**
 * Downloads /public/images/ascend/*.webp from curated Unsplash URLs.
 * Run: node scripts/download-product-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "images", "ascend");

const FILES = {
  "team-studio.webp": "photo-1556905054-24bf8fbf6460",
  "lifestyle-golf.webp": "photo-1592919670787-64ace577ec67",
  "lifestyle-airport.webp": "photo-1436491865332-7a61a109cc05",
  "lifestyle-coastal.webp": "photo-1505142468610-359e7caed608",
  "editorial-architecture.webp": "photo-1486406146926-c627a92ad1ab",
  "brotherhood-dining.webp": "photo-1414235077428-338989a2e8d0",
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
const primary = path.join(outDir, "team-studio.webp");
const seed =
  [primary, path.join(outDir, "lifestyle-airport.webp")].find((p) =>
    fs.existsSync(p),
  ) ?? null;

if (seed) {
  fs.copyFileSync(seed, fallback);
  console.log(`✓ fallback.webp`);
}

console.log(`Done: ${ok}/${Object.keys(FILES).length} images.`);
