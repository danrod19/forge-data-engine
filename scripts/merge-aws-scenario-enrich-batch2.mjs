import fs from "fs";

const bankPath = "src/data/questions_aws_traditional.json";
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const byId = new Map(bank.map((q, i) => [q.id, { q, i }]));

const batch1 = new Set(
  JSON.parse(
    fs.readFileSync("scripts/output/aws_scenarios_enrich_batch.json", "utf8")
  ).ids
);
const batch2ids = new Set(
  JSON.parse(
    fs.readFileSync("scripts/output/aws_scenarios_enrich_batch_2.json", "utf8")
  ).ids
);

const before = JSON.parse(
  fs.readFileSync("scripts/output/aws_scenarios_before_enrich_batch2.json", "utf8")
);
const beforeById = new Map(before.map((q) => [q.id, q]));

const patched = [];
for (let n = 1; n <= 5; n++) {
  const p = JSON.parse(
    fs.readFileSync(`scripts/output/aws_enrich_b2_patch_${n}.json`, "utf8")
  );
  for (const item of p.patched || []) patched.push(item);
}

const errors = [];
const applied = [];
for (const item of patched) {
  if (batch1.has(item.id)) {
    errors.push(`FATAL id ${item.id} is batch1 — refuse`);
    continue;
  }
  if (!batch2ids.has(item.id)) {
    errors.push(`id ${item.id} not in batch2 list`);
    continue;
  }
  const hit = byId.get(item.id);
  if (!hit) {
    errors.push(`missing id ${item.id}`);
    continue;
  }
  const { q, i } = hit;
  if (item.resposta_correta !== q.resposta_correta) {
    errors.push(
      `id ${item.id}: rc changed ${q.resposta_correta} -> ${item.resposta_correta}`
    );
    continue;
  }
  if (!Array.isArray(item.alternativas) || item.alternativas.length !== 4) {
    errors.push(`id ${item.id}: need 4 alts`);
    continue;
  }
  const e = String(item.enunciado || "");
  const x = String(item.explicacao_profunda || "");
  if (e.length < 120) errors.push(`id ${item.id}: enunciado short ${e.length}`);
  if (x.length < 80) errors.push(`id ${item.id}: expl short ${x.length}`);

  bank[i] = {
    ...q,
    enunciado: e,
    alternativas: item.alternativas.map(String),
    resposta_correta: item.resposta_correta,
    explicacao_profunda: x,
  };
  applied.push({
    id: item.id,
    before_len: (q.enunciado || "").length,
    after_len: e.length,
    expl_len: x.length,
  });
}

// verify batch1 unchanged vs before_enrich_batch2 snapshot
const batch1Changed = [];
for (const id of batch1) {
  const a = bank.find((q) => q.id === id);
  const b = beforeById.get(id);
  if (!a || !b) {
    batch1Changed.push(`${id}: missing`);
    continue;
  }
  if (
    a.enunciado !== b.enunciado ||
    a.resposta_correta !== b.resposta_correta ||
    JSON.stringify(a.alternativas) !== JSON.stringify(b.alternativas)
  ) {
    batch1Changed.push(String(id));
  }
}

if (errors.some((e) => e.startsWith("FATAL") || e.includes("rc changed"))) {
  console.error(errors.join("\n"));
  process.exit(1);
}

fs.writeFileSync(bankPath, JSON.stringify(bank));
fs.writeFileSync(
  "scripts/output/aws_scenarios_enrich_batch2_report.json",
  JSON.stringify(
    {
      patched_input: patched.length,
      applied: applied.length,
      soft_errors: errors,
      batch1_changed: batch1Changed,
      avg_before: Math.round(
        applied.reduce((a, x) => a + x.before_len, 0) / (applied.length || 1)
      ),
      avg_after: Math.round(
        applied.reduce((a, x) => a + x.after_len, 0) / (applied.length || 1)
      ),
      ids: applied.map((x) => x.id),
    },
    null,
    2
  )
);

console.log(
  JSON.stringify(
    {
      applied: applied.length,
      soft_errors: errors.length,
      batch1_changed: batch1Changed.length,
      avg_before: Math.round(
        applied.reduce((a, x) => a + x.before_len, 0) / (applied.length || 1)
      ),
      avg_after: Math.round(
        applied.reduce((a, x) => a + x.after_len, 0) / (applied.length || 1)
      ),
    },
    null,
    2
  )
);
if (batch1Changed.length) process.exit(1);
