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
  "photo-1610899632923",
  "photo-1633070374521",
  "photo-1590501949668",
  "photo-1599718100450",
  "photo-1738748444676",
  "photo-1699766868222",
  "photo-1771408662069",
];

for (const id of ids) {
  const needle = `backgroundImage: "url(https://images.unsplash.com/${id}`;
  const i = js.indexOf(needle);
  console.log("\n===", id, "===");
  console.log(js.slice(i, i + 1400));
}
