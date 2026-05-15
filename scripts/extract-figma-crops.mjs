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

const objectPos = [...new Set(js.match(/object-\[[^\]]+\]/g) ?? [])];
console.log("object-pos classes:", objectPos);

const stylePos = [
  ...new Set(
    (js.match(/objectPosition:\s*"[^"]+"/g) ?? []).map((s) => s),
  ),
];
console.log("inline objectPosition:", stylePos);
