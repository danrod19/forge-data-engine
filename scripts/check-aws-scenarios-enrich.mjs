import fs from "fs";

const bank = JSON.parse(
  fs.readFileSync("src/data/questions_aws_traditional.json", "utf8")
);
const ids = JSON.parse(
  fs.readFileSync("scripts/output/aws_scenarios_enrich_batch.json", "utf8")
).ids;

let ok = 0;
const bad = [];
for (const id of ids) {
  const q = bank.find((x) => x.id === id);
  if (!q) {
    bad.push(`${id}: missing`);
    continue;
  }
  const e = q.enunciado || "";
  const x = q.explicacao_profunda || "";
  const alts = q.alternativas || [];
  const issues = [];
  if (e.length < 120) issues.push(`enunciado=${e.length}`);
  if (alts.length !== 4) issues.push(`alts=${alts.length}`);
  if (![0, 1, 2, 3].includes(q.resposta_correta)) issues.push("rc");
  if (x.length < 80) issues.push(`expl=${x.length}`);
  // enriched stems should look English-ish
  if (!/[A-Za-z]{4,}/.test(e)) issues.push("no_en");
  if (issues.length) bad.push(`${id}: ${issues.join(",")}`);
  else ok++;
}
console.log(
  JSON.stringify(
    { checked: ids.length, ok, bad: bad.length, bad_sample: bad.slice(0, 10) },
    null,
    2
  )
);
if (bad.length) process.exit(1);
