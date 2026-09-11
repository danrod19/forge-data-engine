import fs from "fs";

const bank = JSON.parse(
  fs.readFileSync("src/data/questions_aws_traditional.json", "utf8")
);
const b1 = new Set(
  JSON.parse(fs.readFileSync("scripts/output/aws_scenarios_enrich_batch.json", "utf8"))
    .ids
);
const b2 = JSON.parse(
  fs.readFileSync("scripts/output/aws_scenarios_enrich_batch_2.json", "utf8")
).ids;
const before = JSON.parse(
  fs.readFileSync(
    "scripts/output/aws_scenarios_before_enrich_batch2.json",
    "utf8"
  )
);
const beforeMap = new Map(before.map((q) => [q.id, q]));

const overlap = b2.filter((id) => b1.has(id));
let b1ok = 0;
for (const id of b1) {
  const a = bank.find((q) => q.id === id);
  const b = beforeMap.get(id);
  if (
    a &&
    b &&
    a.enunciado === b.enunciado &&
    a.resposta_correta === b.resposta_correta
  )
    b1ok++;
}

let b2changed = 0;
let b2gate = 0;
const fails = [];
for (const id of b2) {
  const a = bank.find((q) => q.id === id);
  const b = beforeMap.get(id);
  if (!a || !b) {
    fails.push(`${id}: missing`);
    continue;
  }
  if (a.enunciado !== b.enunciado) b2changed++;
  const ok =
    a.enunciado.length >= 120 &&
    (a.explicacao_profunda || "").length >= 80 &&
    [0, 1, 2, 3].includes(a.resposta_correta) &&
    (a.alternativas || []).length === 4 &&
    a.resposta_correta === b.resposta_correta;
  if (ok) b2gate++;
  else
    fails.push(
      `${id}: len=${a.enunciado.length} expl=${(a.explicacao_profunda || "").length} rc=${a.resposta_correta}`
    );
}

const avgBefore = Math.round(
  b2.reduce((s, id) => s + (beforeMap.get(id)?.enunciado || "").length, 0) /
    b2.length
);
const avgAfter = Math.round(
  b2.reduce(
    (s, id) => s + (bank.find((q) => q.id === id)?.enunciado || "").length,
    0
  ) / b2.length
);

console.log(
  JSON.stringify(
    {
      total: bank.length,
      overlap: overlap.length,
      batch1_unchanged: `${b1ok}/${b1.size}`,
      batch2_changed_vs_backup: `${b2changed}/${b2.length}`,
      batch2_gate: `${b2gate}/${b2.length}`,
      fails: fails.slice(0, 10),
      avg_before: avgBefore,
      avg_after: avgAfter,
    },
    null,
    2
  )
);

for (const id of [10, 55, 137]) {
  const b = beforeMap.get(id);
  const a = bank.find((q) => q.id === id);
  console.log("====", id);
  console.log("BEFORE:", b.enunciado);
  console.log("AFTER:", a.enunciado);
  console.log("EXPL:", (a.explicacao_profunda || "").slice(0, 200));
  console.log("rc", b.resposta_correta, "->", a.resposta_correta);
}

if (overlap.length || b1ok !== b1.size || b2gate !== b2.length || b2changed !== b2.length) {
  process.exit(1);
}
