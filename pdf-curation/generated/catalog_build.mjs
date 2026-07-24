import fs from "node:fs";
const path = new URL(".", import.meta.url);
const all = [
  ...JSON.parse(fs.readFileSync(new URL("./src_266_315.json", import.meta.url))),
  ...JSON.parse(fs.readFileSync(new URL("./src_316_365.json", import.meta.url))),
  ...JSON.parse(fs.readFileSync(new URL("./src_366_415.json", import.meta.url))),
];
const lines = all.map((q) => {
  const e = q.enunciado.replace(/\s+/g, " ").slice(0, 100);
  const a = q.alternativas
    .map((x, i) => i + ":" + String(x).replace(/\s+/g, " ").slice(0, 55))
    .join(" | ");
  return q.id + "|" + q.resposta_correta + "|" + e + "||" + a;
});
fs.writeFileSync(new URL("./catalog_266_415.txt", import.meta.url), lines.join("\n"));
console.log("ok", lines.length);
const choose = all.filter((q) => /choose\s*(two|three)/i.test(q.enunciado)).map((q) => q.id);
console.log("choose", choose.join(","));
