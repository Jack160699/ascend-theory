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

const IMG = /backgroundImage:\s*"url\((https:\/\/images\.unsplash\.com\/[^)]+)\)"/g;

// Each sticky scene block starts with h-[Xvh] rail
const blocks = [...js.matchAll(/relative h-\[(\d+)vh\] w-full[\s\S]{200,8000}?backgroundImage/g)];

const scenes = [];
for (const m of blocks) {
  const start = m.index;
  const chunk = js.slice(start, start + 9000);
  const vh = Number(m[1]);
  const imgMatch = chunk.match(/backgroundImage:\s*"url\((https:\/\/images\.unsplash\.com\/[^)]+)\)"/);
  const scrim = chunk.match(/bg-\[#0d0d0d\]\/(\d+)/);
  const grad = chunk.match(/bg-gradient-to-([a-z]+)/);
  const headline = chunk.match(
    /children: \[(?:[^[]|\[[^\]]*\])*?"([A-Z][^"]{8,60})"/,
  );
  const headline2 = [...chunk.matchAll(/children: "([^"]{10,80})"/g)].map((x) => x[1]);
  scenes.push({
    vh,
    image: imgMatch?.[1] ?? null,
    scrim: scrim ? Number(scrim[1]) / 100 : null,
    gradientDir: grad?.[1] ?? null,
    headlines: headline2.filter((t) => !t.startsWith("http")).slice(0, 4),
  });
}

console.log(JSON.stringify(scenes, null, 2));
fs.writeFileSync("figma-world-scenes-parsed.json", JSON.stringify(scenes, null, 2));
