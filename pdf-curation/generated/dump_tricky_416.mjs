import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const all = [
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_416_465.json"))),
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_466_515.json"))),
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_516_565.json"))),
];
const ids = [417, 420, 434, 435, 445, 509, 511, 522, 548, 520, 563, 418, 429];
for (const id of ids) {
  const q = all.find((x) => x.id === id);
  console.log("====", id, "ans", q.resposta_correta);
  console.log(q.enunciado.slice(0, 220));
  q.alternativas.forEach((a, i) => console.log(i, a));
  console.log("");
}
