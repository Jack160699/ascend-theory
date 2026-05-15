import fs from "node:fs";
import https from "node:https";

const url =
  "https://evade-ruby-43345898.figma.site/_components/v2/99e323723af64ec61a4adc0ce064f0c752df8548.js";

const js = await new Promise((resolve, reject) => {
  https
    .get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    })
    .on("error", reject);
});

const IMG_RE = /https:\/\/images\.unsplash\.com\/[^"'`\\]+/g;
const unique = [...new Set([...js.matchAll(IMG_RE)].map((m) => m[0].replace(/\)$/, "")))];

// Split bundle into scene-sized chunks by scroll height rails
const railChunks = [...js.matchAll(/h-\[(\d+)vh\][\s\S]{0,12000}?children:/g)];

const sceneTexts = [
  "wasting your potential",
  "lost momentum",
  "addicted to distraction",
  "who you spend time with",
  "structured environment for men",
  "How It Works",
  "What You Build",
  "The Brotherhood",
];

const rails = [];
let searchFrom = 0;
for (const text of sceneTexts) {
  const idx = js.indexOf(text, searchFrom);
  if (idx < 0) continue;
  const start = Math.max(0, idx - 8000);
  const end = Math.min(js.length, idx + 1200);
  const chunk = js.slice(start, end);
  const images = [...chunk.matchAll(IMG_RE)].map((m) => m[0].replace(/\)$/, ""));
  const vh = chunk.match(/h-\[(\d+)vh\]/);
  const scrims = [...chunk.matchAll(/#0d0d0d\]\/(\d+)/g)].map((m) => Number(m[1]) / 100);
  const scale = chunk.match(/scale:\s*([0-9.]+)/);
  rails.push({
    text,
    scrollVh: vh ? Number(vh[1]) : null,
    image: images[0] ?? null,
    allImages: [...new Set(images)],
    scrim: scrims.length ? Math.max(...scrimHints(scrims)) : null,
    scale: scale ? Number(scale[1]) : null,
  });
  searchFrom = idx + 1;
}

function scrimHints(arr) {
  return arr.filter((n) => n >= 0.7 && n <= 0.95);
}

// Global order: first occurrence index of each URL
const order = unique
  .map((u) => ({ url: u, idx: js.indexOf(u) }))
  .sort((a, b) => a.idx - b.idx);

const out = { unique, order, rails };
fs.writeFileSync("figma-world-images.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
