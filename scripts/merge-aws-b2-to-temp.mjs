import fs from "fs";
import os from "os";
import path from "path";

const root = process.cwd();
const bankPath = path.join(root, "src/data/questions_aws_traditional.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const byId = new Map(bank.map((q, i) => [q.id, { q, i }]));

const batch1 = new Set(
  JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/output/aws_scenarios_enrich_batch.json"),
      "utf8"
    )
  ).ids
);
const batch2ids = new Set(
  JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/output/aws_scenarios_enrich_batch_2.json"),
      "utf8"
    )
  ).ids
);
const before = JSON.parse(
  fs.readFileSync(
    path.join(root, "scripts/output/aws_scenarios_before_enrich_batch2.json"),
    "utf8"
  )
);
const beforeById = new Map(before.map((q) => [q.id, q]));

const patched = [];
for (let n = 1; n <= 5; n++) {
  const p = JSON.parse(
    fs.readFileSync(
      path.join(root, `scripts/output/aws_enrich_b2_patch_${n}.json`),
      "utf8"
    )
  );
  for (const item of p.patched || []) patched.push(item);
}

const errors = [];
const applied = [];
for (const item of patched) {
  if (batch1.has(item.id)) {
    errors.push(`FATAL batch1 ${item.id}`);
    continue;
  }
  if (!batch2ids.has(item.id)) {
    errors.push(`not in batch2 ${item.id}`);
    continue;
  }
  const hit = byId.get(item.id);
  if (!hit) {
    errors.push(`missing ${item.id}`);
    continue;
  }
  const { q, i } = hit;
  if (item.resposta_correta !== q.resposta_correta) {
    errors.push(`rc ${item.id}`);
    continue;
  }
  if (!Array.isArray(item.alternativas) || item.alternativas.length !== 4) {
    errors.push(`alts ${item.id}`);
    continue;
  }
  const e = String(item.enunciado || "");
  const x = String(item.explicacao_profunda || "");
  if (e.length < 120) errors.push(`short e ${item.id}`);
  if (x.length < 80) errors.push(`short x ${item.id}`);
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
  });
}

let batch1Changed = 0;
for (const id of batch1) {
  const a = bank.find((q) => q.id === id);
  const b = beforeById.get(id);
  if (!a || !b || a.enunciado !== b.enunciado || a.resposta_correta !== b.resposta_correta) {
    batch1Changed++;
  }
}

if (errors.some((e) => e.startsWith("FATAL") || e.startsWith("rc "))) {
  console.error(errors);
  process.exit(1);
}

const tmp = path.join(os.tmpdir(), "questions_aws_traditional_b2.json");
fs.writeFileSync(tmp, JSON.stringify(bank));
const report = {
  tmp,
  applied: applied.length,
  errors,
  batch1Changed,
  avg_before: Math.round(
    applied.reduce((a, x) => a + x.before_len, 0) / (applied.length || 1)
  ),
  avg_after: Math.round(
    applied.reduce((a, x) => a + x.after_len, 0) / (applied.length || 1)
  ),
  total: bank.length,
};
fs.writeFileSync(
  path.join(root, "scripts/output/aws_scenarios_enrich_batch2_report.json"),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
