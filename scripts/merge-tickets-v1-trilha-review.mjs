import fs from "fs";

const before = JSON.parse(
  fs.readFileSync(
    "scripts/output/tickets_v1_trilha_before_review.json",
    "utf8"
  )
);

const reviewed = [];
for (let i = 0; ; i++) {
  const p = `scripts/output/v1_batch_${i}_reviewed.json`;
  if (!fs.existsSync(p)) break;
  reviewed.push(...JSON.parse(fs.readFileSync(p, "utf8")));
}

if (reviewed.length !== before.length) {
  console.error("LENGTH_MISMATCH", reviewed.length, before.length);
  process.exit(1);
}

let bad = 0;
let sintomaChanged = 0;
let explChanged = 0;
let cliChanged = 0;
const light = [];
const samples = [];
const expls = [];

// Group by source file
const byFile = new Map();

for (let i = 0; i < before.length; i++) {
  const o = before[i];
  const r = reviewed[i];

  if (
    o.id !== r.id ||
    o.resposta_correta !== r.resposta_correta ||
    JSON.stringify(o.alternativas) !== JSON.stringify(r.alternativas) ||
    (o.part_id || "") !== (r.part_id || "")
  ) {
    bad++;
    console.error("invariant", o._sourceFile, o.id);
  }

  const sc = (o.sintoma || "") !== (r.sintoma || "");
  const ec =
    (o.explicacao_profunda || "") !== (r.explicacao_profunda || "");
  const cc = (o.cli_output || "") !== (r.cli_output || "");
  if (sc) sintomaChanged++;
  if (ec) explChanged++;
  if (cc) cliChanged++;
  if (!sc && !ec) light.push(`${o._sourceFile}#${o.id}`);

  if (samples.length < 3 && (sc || ec)) {
    samples.push({ id: o.id, file: o._sourceFile, sb: o.sintoma, sa: r.sintoma });
  }
  if (expls.length < 3 && ec) {
    expls.push({
      id: o.id,
      file: o._sourceFile,
      eb: o.explicacao_profunda,
      ea: r.explicacao_profunda,
    });
  }

  const file = r._sourceFile || o._sourceFile;
  const idx = r._sourceIndex ?? o._sourceIndex;
  if (!byFile.has(file)) byFile.set(file, []);
  const clean = { ...r };
  delete clean._sourceFile;
  delete clean._sourceIndex;
  byFile.get(file)[idx] = clean;
}

if (bad > 0) {
  console.error("bad gabarito", bad);
  process.exit(1);
}

for (const [file, arr] of byFile) {
  // ensure dense array
  if (arr.some((x) => !x)) {
    console.error("sparse array", file);
    process.exit(1);
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n");
  console.log("wrote", file, arr.length);
}

let md = `# Tickets V1 Trilha review report

## Cadeia UI

\`\`\`
getTicketsPool("ccna-v1")
  → curatedModuleTickets (tickets.ts)
    → module1Tickets  ← src/data/parts/part-1.1…1.6-tickets.json
    → module2Tickets  ← src/data/tickets_module2.json
    → module3Tickets  ← src/data/tickets_module3.json
    → module4Tickets  ← src/data/tickets_module4.json
    → module5Tickets  ← src/data/tickets_module5.json
    → module6Tickets  ← src/data/tickets_module6.json
\`\`\`

**Não revisado:** \`tickets_all_merged.json\`, \`tickets_unique.json\`, \`tickets_from_bulk.json\` (fora do pool da Trilha V1).

| Métrica | Valor |
|---------|-------|
| Total no pool Trilha V1 | ${reviewed.length} |
| Sintomas reescritos/polidos | ${sintomaChanged} |
| Explicações reescritas | ${explChanged} |
| CLI alterado | ${cliChanged} |
| IDs só limpeza leve / inalterados | ${light.length ? light.join(", ") : "—"} |
| bad gabarito | 0 |

## Amostras — sintomas (antes → depois)

`;

for (const x of samples) {
  md += `### ID ${x.id} (\`${x.file}\`)
**Antes:** ${x.sb}

**Depois:** ${x.sa}

`;
}

md += `## Amostras — explicações (antes → depois)

`;

for (const x of expls) {
  md += `### ID ${x.id} (\`${x.file}\`)
**Antes:** ${x.eb}

**Depois:** ${x.ea}

`;
}

md += `## Invariantes

- \`resposta_correta\` e texto das \`alternativas\` preservados em 100% dos itens.
- Backup: \`scripts/output/tickets_v1_trilha_before_review.json\`
`;

fs.writeFileSync("scripts/output/tickets_v1_trilha_review_report.md", md);
console.log({
  total: reviewed.length,
  sintomaChanged,
  explChanged,
  cliChanged,
  light: light.length,
  bad: 0,
});
console.log(md.slice(0, 1800));
