import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "questions_bulk_completo (1).json"), "utf8")
);
const slice = d.filter((q) => q.id >= 566 && q.id <= 777);
console.log("count", slice.length, "first", slice[0]?.id, "last", slice[slice.length - 1]?.id);
const ranges = [
  [566, 630],
  [631, 700],
  [701, 777],
];
for (const [a, b] of ranges) {
  const s = slice.filter((q) => q.id >= a && q.id <= b);
  fs.writeFileSync(path.join(__dirname, `src_${a}_${b}.json`), JSON.stringify(s, null, 2));
  console.log(`${a}-${b}`, s.length);
}
const lines = slice.map((q) => {
  const e = q.enunciado.replace(/\s+/g, " ").slice(0, 95);
  const a = q.alternativas
    .map((x, i) => i + ":" + String(x).replace(/\s+/g, " ").slice(0, 45))
    .join(" | ");
  return q.id + "|" + q.resposta_correta + "|" + e + "||" + a;
});
fs.writeFileSync(path.join(__dirname, "catalog_566_777.txt"), lines.join("\n"));
const choose = slice
  .filter((q) => /choose\s*(two|three)|which two|which three/i.test(q.enunciado))
  .map((q) => q.id);
console.log("choose", choose.join(",") || "none");
const mangled = slice
  .filter((q) =>
    q.alternativas.some(
      (a) => /[A-F]\.\s|E\.|F\.|PAGE|QUESTION/i.test(a) || a.length > 180
    )
  )
  .map((q) => q.id);
console.log("mangled count", mangled.length, mangled.slice(0, 40).join(","));
