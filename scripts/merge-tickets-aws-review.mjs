import fs from "fs";

const original = JSON.parse(
  fs.readFileSync("scripts/output/tickets_aws_before_review.json", "utf8")
);
const reviewed = [0, 1, 2, 3]
  .map((i) =>
    JSON.parse(
      fs.readFileSync(`scripts/output/aws_batch_${i}_reviewed.json`, "utf8")
    )
  )
  .flat();

if (reviewed.length !== original.length) {
  console.error("LENGTH_MISMATCH", reviewed.length, original.length);
  process.exit(1);
}

let bad = 0;
let sintomaChanged = 0;
let explChanged = 0;
let cliChanged = 0;
const light = [];
const samples = [];
const expls = [];

for (let i = 0; i < original.length; i++) {
  const o = original[i];
  const r = reviewed[i];
  if (
    o.id !== r.id ||
    o.resposta_correta !== r.resposta_correta ||
    JSON.stringify(o.alternativas) !== JSON.stringify(r.alternativas) ||
    o.part_id !== r.part_id
  ) {
    bad++;
    console.error("invariant fail", o.id);
  }
  const sc = (o.sintoma || "") !== (r.sintoma || "");
  const ec =
    (o.explicacao_profunda || "") !== (r.explicacao_profunda || "");
  const cc = (o.cli_output || "") !== (r.cli_output || "");
  if (sc) sintomaChanged++;
  if (ec) explChanged++;
  if (cc) cliChanged++;
  if (!sc && !ec) light.push(o.id);
  if (samples.length < 3 && (sc || ec)) {
    samples.push({
      id: o.id,
      sb: o.sintoma,
      sa: r.sintoma,
    });
  }
  if (expls.length < 3 && ec) {
    expls.push({
      id: o.id,
      eb: o.explicacao_profunda,
      ea: r.explicacao_profunda,
    });
  }
}

if (bad > 0) {
  console.error("bad gabarito/alts", bad);
  process.exit(1);
}

fs.writeFileSync(
  "src/data/tickets_aws.json",
  JSON.stringify(reviewed, null, 2) + "\n"
);

if (fs.existsSync("aws/final/tickets_aws.json")) {
  fs.writeFileSync(
    "aws/final/tickets_aws.json",
    JSON.stringify(reviewed, null, 2) + "\n"
  );
  console.log("synced aws/final/tickets_aws.json");
}
if (fs.existsSync("aws/final/tickets_FINAL.json")) {
  fs.writeFileSync(
    "aws/final/tickets_FINAL.json",
    JSON.stringify(reviewed, null, 2) + "\n"
  );
  console.log("synced aws/final/tickets_FINAL.json");
}

let md = `# Tickets AWS review report

**Fonte UI Trilha aws:** \`src/data/tickets_aws.json\` ← \`aws-banks.ts\` (\`awsTickets\`) ← \`tickets.ts\` \`getTicketsPool("aws")\` → \`awsModuleTickets\`.

| Métrica | Valor |
|---------|-------|
| Total tickets | ${reviewed.length} |
| Sintomas reescritos/polidos | ${sintomaChanged} |
| Explicações reescritas | ${explChanged} |
| CLI alterado (limpeza) | ${cliChanged} |
| IDs só limpeza leve / inalterados | ${light.length ? light.join(", ") : "—"} |
| bad gabarito | 0 |

## Amostras — sintomas (antes → depois)

`;

for (const x of samples) {
  md += `### ID ${x.id}
**Antes:** ${x.sb}

**Depois:** ${x.sa}

`;
}

md += `## Amostras — explicações (antes → depois)

`;

for (const x of expls) {
  md += `### ID ${x.id}
**Antes:** ${x.eb}

**Depois:** ${x.ea}

`;
}

md += `## Invariantes

- \`resposta_correta\` e texto das \`alternativas\` preservados em 100% dos itens.
- Nenhum ticket novo inventado.
- Backup: \`scripts/output/tickets_aws_before_review.json\`
`;

fs.writeFileSync("scripts/output/tickets_aws_review_report.md", md);
console.log({
  sintomaChanged,
  explChanged,
  cliChanged,
  light: light.length,
  bad: 0,
});
console.log(md.slice(0, 2200));
