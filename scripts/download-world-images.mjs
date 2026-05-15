/**
 * Download WORLD SYSTEM scene stills from the published Figma Make bundle (Unsplash URLs).
 * Output: public/images/world/*.webp
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import sharp from "sharp";

const OUT_DIR = path.join("public", "images", "world");

const SCENES = [
  {
    file: "hero.webp",
    url: "https://images.unsplash.com/photo-1610899632923-3751bc4b427a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "momentum.webp",
    url: "https://images.unsplash.com/photo-1633070374521-b45f91ea5cec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "distraction.webp",
    url: "https://images.unsplash.com/photo-1590501949668-2442efd4d3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "environment.webp",
    url: "https://images.unsplash.com/photo-1599718100450-8c59eed42a40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "solution.webp",
    url: "https://images.unsplash.com/photo-1738748444676-113d30c9a25b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "how-it-works.webp",
    url: "https://images.unsplash.com/photo-1699766868222-56056eb963ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
  {
    file: "brotherhood.webp",
    url: "https://images.unsplash.com/photo-1771408662069-7a78b1942801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85",
  },
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const scene of SCENES) {
  const dest = path.join(OUT_DIR, scene.file);
  process.stdout.write(`Downloading ${scene.file}... `);
  const buf = await fetchBuffer(scene.url);
  await sharp(buf)
    .webp({ quality: 82, effort: 4 })
    .toFile(dest);
  const stat = fs.statSync(dest);
  console.log(`ok (${Math.round(stat.size / 1024)}kb)`);
}

console.log("Done — world images in public/images/world/");
