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

const out = {
  clamps: [...new Set(js.match(/clamp\([^)]+\)/g) ?? [])],
  vhHeights: [...new Set(js.match(/h-\[[\d.]+vh\]/g) ?? [])],
  scrollHeights: [...new Set(js.match(/\d+vh/g) ?? [])].filter((v) => {
    const n = parseInt(v, 10);
    return n >= 100 && n <= 200;
  }),
  overlays: [...new Set(js.match(/bg-\[#0d0d0d\][^`'"]{0,40}/g) ?? [])].slice(0, 20),
  gradients: [
    ...new Set(js.match(/(?:from|via|to)-\[#0d0d0d\][^`'"]{0,30}/g) ?? []),
  ].slice(0, 30),
  objectPos: [...new Set(js.match(/object-\[[^\]]+\]/g) ?? [])],
  tracking: [...new Set(js.match(/tracking-\[[^\]]+\]/g) ?? [])],
  imageUrls: [
    ...new Set(
      (js.match(/https:\/\/[^\s"'`\\]+/g) ?? []).filter(
        (u) =>
          u.includes("figma") ||
          u.includes("unsplash") ||
          u.includes("/_assets/") ||
          u.includes("images"),
      ),
    ),
  ].slice(0, 40),
};

// Scene order hints
const scenes = [
  "wasting your potential",
  "lost momentum",
  "addicted to distraction",
  "who you spend time with",
  "structured environment",
  "How It Works",
  "What You Build",
  "Brotherhood",
  "Transformation",
  "Choose your environment",
  "rebuild yourself",
];
for (const s of scenes) {
  const idx = js.indexOf(s);
  if (idx > -1) {
    out[`context_${s.slice(0, 20)}`] = js.slice(Math.max(0, idx - 200), idx + 400);
  }
}

fs.writeFileSync("figma-extract.json", JSON.stringify(out, null, 2));
console.log("wrote figma-extract.json", Object.keys(out).length, "keys");
