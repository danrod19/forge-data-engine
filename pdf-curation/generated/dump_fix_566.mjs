import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const all = [
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_566_630.json"))),
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_631_700.json"))),
  ...JSON.parse(fs.readFileSync(path.join(dir, "src_701_777.json"))),
];
for (const id of [580, 574, 596, 653, 690, 770, 747, 739, 727, 648, 750, 753, 777, 586, 588]) {
  const q = all.find((x) => x.id === id);
  console.log("====", id, "ans", q.resposta_correta);
  console.log(q.enunciado.slice(0, 200));
  q.alternativas.forEach((a, i) => console.log(i, a.slice(0, 160)));
  console.log("");
}
