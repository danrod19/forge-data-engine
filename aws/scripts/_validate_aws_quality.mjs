import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const final = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "final");
const q = JSON.parse(fs.readFileSync(path.join(final, "questions_aws_traditional.json"), "utf8"));
const t = JSON.parse(fs.readFileSync(path.join(final, "tickets_aws.json"), "utf8"));
const ban = [
  /No SAA, amarre/i,
  /descarte opções que misturam/i,
  /descarte distractors/i,
  /Confirme também listener/i,
  /Fundamente com o serviço e o trade-off/i,
  /Justifique com o requisito do enunciado e a evidência operacional/i,
  /amarre a escolha ao requisito/i,
  /Revise o requisito desta questão/i,
  /antes de generalizar o serviço/i,
  /Contexto R53\/CloudFront/i,
  /Contexto .+#\d+:/i,
  /distractor ignora/i,
  /Detalhe operacional #\d+/i,
  /No cenário de/i,
  /opção fraca ignora/i,
  /Evidência da Q\d+/i,
  /Distractor fraco/i,
  /Em Lambda #\d+/i,
  /Access pattern #\d+/i,
];
let hits = 0;
const hitSamples = [];
for (const x of q) {
  for (const re of ban) {
    if (re.test(x.explicacao_profunda || "")) {
      hits++;
      if (hitSamples.length < 5) hitSamples.push(`${x.part_id}:${x.id}`);
    }
  }
}
const focus = process.argv[2] || "aws-1.7";
const p = q.filter((x) => x.part_id === focus);
const ql = p.map((x) => x.explicacao_profunda.length);
const tl = t.filter((x) => x.part_id === focus).map((x) => x.explicacao_profunda.length);
const rc = [0, 0, 0, 0];
p.forEach((x) => rc[x.resposta_correta]++);
const allMin = Math.min(...q.map((x) => x.explicacao_profunda.length));
console.log(
  JSON.stringify(
    {
      parts: JSON.parse(fs.readFileSync(path.join(final, "parts_index.json"), "utf8")).length,
      q: q.length,
      t: t.length,
      free: q.filter((x) => !x.isPremium).length,
      hits,
      hitSamples,
      all_min: allMin,
      short: q.filter((x) => x.explicacao_profunda.length < 220).length,
      focus,
      focus_n: p.length,
      focus_min: p.length ? Math.min(...ql) : null,
      focus_avg: p.length ? Math.round(ql.reduce((a, b) => a + b, 0) / ql.length) : null,
      focus_t_min: tl.length ? Math.min(...tl) : null,
      rc,
    },
    null,
    2
  )
);
