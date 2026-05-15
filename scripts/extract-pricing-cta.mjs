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

for (const marker of ["Levels of Entry", "Choose your", "Ready to", "rebuild yourself", "BEGIN", "IMMERSION", "INNER CIRCLE"]) {
  const i = js.indexOf(marker);
  if (i < 0) {
    console.log("missing", marker);
    continue;
  }
  console.log("\n===", marker, "===");
  console.log(js.slice(Math.max(0, i - 1200), i + 1500));
}
