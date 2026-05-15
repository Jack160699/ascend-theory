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

const ids = [
  ["momentum", "photo-1633070374521", "lost momentum"],
  ["distraction", "photo-1590501949668", "addicted to distraction"],
  ["environment", "photo-1599718100450", "who you spend time with"],
  ["solution", "photo-1738748444676", "The Solution"],
  ["howItWorks", "photo-1699766868222", "How It Works"],
  ["whatYouBuild", "photo-1738748444676", "What You Build"],
  ["brotherhood", "photo-1771408662069", "The Brotherhood"],
];

for (const [name, id, marker] of ids) {
  const needle = `backgroundImage: "url(https://images.unsplash.com/${id}`;
  const i = js.indexOf(needle);
  const chunk = js.slice(i, i + 2200);
  const pos = chunk.match(/backgroundPosition: "([^"]+)"/)?.[1];
  const scrim = chunk.match(/bg-\[#0d0d0d\]\/(\d+)/)?.[1];
  const grad = chunk.match(/bg-gradient-to-([a-z]+)[^"]*from-\[#0d0d0d\]\/(\d+)[^"]*via-\[#0d0d0d\]\/(\d+)[^"]*(?:to-\[#0d0d0d\]\/(\d+)|to-\[#0d0d0d\]")/);
  const copy = chunk.match(/absolute (bottom-\d+|left-0 top-1\/2)[^"]*"/)?.[0];
  const clamp = chunk.match(/fontSize: "clamp\([^"]+\)"/)?.[0];
  console.log(JSON.stringify({ name, pos, scrim: scrim ? Number(scrim) / 100 : null, grad, copy, clamp }, null, 0));
}

const tr = js.indexOf("The Transformation");
console.log("transformation", js.slice(tr - 400, tr + 600).slice(0, 500));
