import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const final = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "final");
const q = JSON.parse(fs.readFileSync(path.join(final, "questions_traditional_FINAL.json"), "utf8"));
const t = JSON.parse(fs.readFileSync(path.join(final, "tickets_FINAL.json"), "utf8"));
const needles = [
  "No SAA, amarre",
  "Confirme também listener",
  "Revise o requisito desta questão",
  "Fundamente com o serviço",
  "descarte opções",
  "descarte distractors",
  "distractor ignora",
  "No cenário de",
  "opção fraca ignora",
  "Distractor fraco",
  "Em Lambda #",
  "Access pattern #",
  "No desenho de tabela",
  "Dimensões erradas deixam a métrica",
  "Retention de log group impacta custo",
  "Action SNS/ASG só corre se o alarme",
  "Statistic Avg vs Sum muda o significado",
  "Periodo e datapoints definem se o alarme",
  "Metric filter + alarm cobrem erro",
  "valide role, timeout, concurrency e path de rede",
  "modele PK/SK e RCU/WCU antes de escalar com Scan",
  "Evidência da Q",
  "Detalhe operacional #",
  "antes de generalizar o serviço",
];
let total = 0;
for (const n of needles) {
  const re = new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  let h = 0;
  for (const x of [...q, ...t]) {
    if (re.test(x.explicacao_profunda || "")) h++;
  }
  if (h) console.log("HIT", n, h);
  total += h;
}
let c = 0;
for (const x of [...q, ...t]) {
  if (/Contexto\s+.+#\d+/i.test(x.explicacao_profunda || "")) c++;
}
if (c) console.log("HIT Contexto #N", c);
console.log(
  JSON.stringify({
    q: q.length,
    t: t.length,
    total_hits: total + c,
    short_q: q.filter((x) => x.explicacao_profunda.length < 220).length,
    short_t: t.filter((x) => x.explicacao_profunda.length < 200).length,
    parts: new Set(q.map((x) => x.part_id)).size,
  })
);
