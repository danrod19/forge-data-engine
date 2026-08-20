import fs from "fs";

const bankPath = "src/data/questions_aws_traditional.json";
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const byId = new Map(bank.map((q, i) => [q.id, { q, i }]));

const patched = [];
for (let n = 1; n <= 5; n++) {
  const p = JSON.parse(
    fs.readFileSync(`scripts/output/aws_enrich_patch_${n}.json`, "utf8")
  );
  for (const item of p.patched || []) patched.push(item);
}

const errors = [];
const applied = [];
for (const item of patched) {
  const hit = byId.get(item.id);
  if (!hit) {
    errors.push(`missing id ${item.id}`);
    continue;
  }
  const { q, i } = hit;
  if (typeof item.resposta_correta !== "number") {
    errors.push(`id ${item.id}: bad rc type`);
    continue;
  }
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
  // keep same correct answer meaning loosely: correct alt must still be non-empty
  if (!String(item.alternativas[item.resposta_correta] || "").trim()) {
    errors.push(`id ${item.id}: empty correct alt`);
    continue;
  }

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

if (errors.length) {
  console.error("ERRORS", errors.length);
  console.error(errors.slice(0, 30).join("\n"));
  if (errors.some((e) => e.includes("rc changed") || e.includes("missing"))) {
    process.exit(1);
  }
}

fs.writeFileSync(bankPath, JSON.stringify(bank));
fs.writeFileSync(
  "scripts/output/aws_scenarios_enrich_report.json",
  JSON.stringify(
    {
      patched_input: patched.length,
      applied: applied.length,
      soft_errors: errors,
      sample: applied.slice(0, 5),
      avg_before: Math.round(
        applied.reduce((a, x) => a + x.before_len, 0) / applied.length
      ),
      avg_after: Math.round(
        applied.reduce((a, x) => a + x.after_len, 0) / applied.length
      ),
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
      avg_before: Math.round(
        applied.reduce((a, x) => a + x.before_len, 0) / applied.length
      ),
      avg_after: Math.round(
        applied.reduce((a, x) => a + x.after_len, 0) / applied.length
      ),
    },
    null,
    2
  )
);
