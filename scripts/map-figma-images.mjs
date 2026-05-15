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

const urls = [...js.matchAll(/https:\/\/images\.unsplash\.com\/[^"'`\\]+/g)].map(
  (m) => m[0],
);
const unique = [];
for (const u of urls) {
  if (!unique.includes(u)) unique.push(u);
}
unique.forEach((u, i) => console.log(i + 1, u.split("photo-")[1]?.slice(0, 30)));

// per-scene h-[Xvh] near images
const parts = js.split("h-[");
for (let i = 1; i < parts.length; i++) {
  const h = parts[i].slice(0, 6);
  const chunk = parts[i].slice(0, 2500);
  const img = chunk.match(/photo-\d+-[a-f0-9]+/);
  const text = chunk.match(
    /children: "(You [^"]+|ASCEND|Curated|The Solution|How It|What You|Confident)/,
  );
  console.log(`h-[${h}`, img?.[0] ?? "-", text?.[1] ?? "-");
}
