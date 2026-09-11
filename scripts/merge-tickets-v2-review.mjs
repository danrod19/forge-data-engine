import fs from "fs";

const original = JSON.parse(
  fs.readFileSync("src/data/tickets_v2.json", "utf8")
);
const batches = [0, 1, 2, 3, 4].map((i) =>
  JSON.parse(
    fs.readFileSync(`scripts/output/batch_${i}_reviewed.json`, "utf8")
  )
);
const reviewed = batches.flat();

if (reviewed.length !== original.length) {
  console.error("LENGTH_MISMATCH", reviewed.length, original.length);
  process.exit(1);
}

const issues = [];
let sintomaChanged = 0;
let explChanged = 0;
let cliChanged = 0;
const lightOnly = [];
const beforeAfter = [];

for (let i = 0; i < original.length; i++) {
  const o = original[i];
  const r = reviewed[i];
  if (o.id !== r.id) issues.push(`id order ${o.id} vs ${r.id}`);
  if (o.resposta_correta !== r.resposta_correta)
    issues.push(`gabarito ${o.id}`);
  if (JSON.stringify(o.alternativas) !== JSON.stringify(r.alternativas))
    issues.push(`alts ${o.id}`);
  if (o.part_id !== r.part_id) issues.push(`part ${o.id}`);
  if (o.question_type !== r.question_type) issues.push(`type ${o.id}`);

  const sCh = (o.sintoma || "") !== (r.sintoma || "");
  const eCh =
    (o.explicacao_profunda || "") !== (r.explicacao_profunda || "");
  const cCh = (o.cli_output || "") !== (r.cli_output || "");
  if (sCh) sintomaChanged++;
  if (eCh) explChanged++;
  if (cCh) cliChanged++;
  if (!sCh && !eCh) lightOnly.push(o.id);

  if (beforeAfter.length < 3 && (sCh || eCh)) {
    beforeAfter.push({
      id: o.id,
      sintoma_before: o.sintoma,
      sintoma_after: r.sintoma,
      expl_before: o.explicacao_profunda,
      expl_after: r.explicacao_profunda,
    });
  }

  if ((r.explicacao_profunda || "").length < 180) {
    issues.push(
      `short_expl ${o.id} len=${(r.explicacao_profunda || "").length}`
    );
  }
}

if (issues.length) {
  console.error("ISSUES", issues.slice(0, 30));
  process.exit(1);
}

fs.copyFileSync(
  "src/data/tickets_v2.json",
  "scripts/output/tickets_v2_before_review.json"
);
fs.writeFileSync(
  "src/data/tickets_v2.json",
  JSON.stringify(reviewed, null, 2) + "\n"
);

if (fs.existsSync("v2/final/tickets_v2.json")) {
  fs.writeFileSync(
    "v2/final/tickets_v2.json",
    JSON.stringify(reviewed, null, 2) + "\n"
  );
  console.log("synced v2/final/tickets_v2.json");
}

const explSamples = reviewed
  .filter(
    (_, i) =>
      (original[i].explicacao_profunda || "") !==
      (reviewed[i].explicacao_profunda || "")
  )
  .slice(0, 3)
  .map((r) => {
    const o = original.find((x) => x.id === r.id);
    return {
      id: r.id,
      before: o.explicacao_profunda,
      after: r.explicacao_profunda,
    };
  });

let md = `# Tickets V2 review report

**Fonte UI Trilha ccna-v2:** \`src/data/tickets_v2.json\` ← \`v2-banks.ts\` (\`v2Tickets\`) ← \`tickets.ts\` \`getTicketsPool("ccna-v2")\` → \`v2ModuleTickets\`.

| Métrica | Valor |
|---------|-------|
| Total tickets | ${reviewed.length} |
| Sintomas reescritos/polidos | ${sintomaChanged} |
| Explicações reescritas | ${explChanged} |
| CLI alterado (limpeza) | ${cliChanged} |
| IDs só limpeza leve / inalterados | ${lightOnly.length ? lightOnly.join(", ") : "—"} |

## Amostras — sintomas (antes → depois)

`;

for (const s of beforeAfter) {
  md += `### ID ${s.id}
**Antes:** ${s.sintoma_before}

**Depois:** ${s.sintoma_after}

`;
}

md += `## Amostras — explicações (antes → depois)

`;

for (const s of explSamples) {
  md += `### ID ${s.id}
**Antes:** ${s.before}

**Depois:** ${s.after}

`;
}

md += `## Invariantes

- \`resposta_correta\` e texto das \`alternativas\` preservados em 100% dos itens.
- Nenhum ticket novo inventado.
- Backup pré-review: \`scripts/output/tickets_v2_before_review.json\`
`;

fs.writeFileSync("scripts/output/tickets_v2_review_report.md", md);
console.log("OK wrote tickets_v2.json");
console.log({ sintomaChanged, explChanged, cliChanged, lightOnly: lightOnly.length });
console.log(md.slice(0, 2000));
