import fs from "fs";

const bank = JSON.parse(
  fs.readFileSync("src/data/questions_aws_traditional.json", "utf8")
);
const b1 = new Set(
  JSON.parse(fs.readFileSync("scripts/output/aws_scenarios_enrich_batch.json", "utf8"))
    .ids
);
const b2 = new Set(
  JSON.parse(
    fs.readFileSync("scripts/output/aws_scenarios_enrich_batch_2.json", "utf8")
  ).ids
);
const b3 = JSON.parse(
  fs.readFileSync("scripts/output/aws_scenarios_enrich_batch_3.json", "utf8")
).ids;
const before = JSON.parse(
  fs.readFileSync(
    "scripts/output/aws_scenarios_before_enrich_batch3.json",
    "utf8"
  )
);
const beforeMap = new Map(before.map((q) => [q.id, q]));
const prior = new Set([...b1, ...b2]);

const overlap = b3.filter((id) => prior.has(id));
let priorOk = 0;
for (const id of prior) {
  const a = bank.find((q) => q.id === id);
  const b = beforeMap.get(id);
  if (
    a &&
    b &&
    a.enunciado === b.enunciado &&
    a.resposta_correta === b.resposta_correta
  )
    priorOk++;
}

let b3changed = 0;
let b3gate = 0;
const fails = [];
for (const id of b3) {
  const a = bank.find((q) => q.id === id);
  const b = beforeMap.get(id);
  if (!a || !b) {
    fails.push(`${id}: missing`);
    continue;
  }
  if (a.enunciado !== b.enunciado) b3changed++;
  const ok =
    a.enunciado.length >= 120 &&
    (a.explicacao_profunda || "").length >= 80 &&
    [0, 1, 2, 3].includes(a.resposta_correta) &&
    (a.alternativas || []).length === 4 &&
    a.resposta_correta === b.resposta_correta;
  if (ok) b3gate++;
  else
    fails.push(
      `${id}: len=${a.enunciado.length} expl=${(a.explicacao_profunda || "").length}`
    );
}

const avgBefore = Math.round(
  b3.reduce((s, id) => s + (beforeMap.get(id)?.enunciado || "").length, 0) /
    b3.length
);
const avgAfter = Math.round(
  b3.reduce(
    (s, id) => s + (bank.find((q) => q.id === id)?.enunciado || "").length,
    0
  ) / b3.length
);

console.log(
  JSON.stringify(
    {
      total: bank.length,
      overlap: overlap.length,
      prior_unchanged: `${priorOk}/${prior.size}`,
      batch3_changed: `${b3changed}/${b3.length}`,
      batch3_gate: `${b3gate}/${b3.length}`,
      fails: fails.slice(0, 10),
      avg_before: avgBefore,
      avg_after: avgAfter,
      total_rich_estimate: prior.size + b3gate,
    },
    null,
    2
  )
);

for (const id of [19, 38, 278]) {
  const b = beforeMap.get(id);
  const a = bank.find((q) => q.id === id);
  console.log("====", id);
  console.log("BEFORE:", b.enunciado);
  console.log("AFTER:", a.enunciado);
  console.log("EXPL:", (a.explicacao_profunda || "").slice(0, 200));
  console.log("rc", b.resposta_correta, "->", a.resposta_correta);
}

if (
  overlap.length ||
  priorOk !== prior.size ||
  b3gate !== b3.length ||
  b3changed !== b3.length
) {
  process.exit(1);
}
