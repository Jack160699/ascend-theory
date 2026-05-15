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

const markers = [
  "wasting your potential",
  "lost momentum",
  "addicted to distraction",
  "who you spend time with",
  "structured environment for men",
  "How It Works",
  "What You Build",
  "The Brotherhood",
  "The Transformation",
  "Choose your environment",
  "Ready to rebuild",
];

const scenes = {};
for (const m of markers) {
  const idx = js.indexOf(m);
  if (idx < 0) continue;
  scenes[m] = js.slice(Math.max(0, idx - 3500), idx + 800);
}

fs.writeFileSync("figma-scenes-snippet.txt", JSON.stringify(scenes, null, 2));

const tailwind = [
  ...new Set(
    js.match(
      /(?:bg-\[#0d0d0d\][^\s"`]+|from-\[#0d0d0d\][^\s"`]+|via-\[#0d0d0d\][^\s"`]+|to-\[#0d0d0d\][^\s"`]+|bottom-\d+|px-5|py-8|py-32|leading-\[0\.85\]|text-white\/\d+)/g,
    ) ?? [],
  ),
].slice(0, 80);

console.log("tailwind samples:", tailwind.join("\n"));
