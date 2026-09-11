import fs from "fs";

const before = JSON.parse(
  fs.readFileSync(
    "scripts/output/questions_v2_traditional_before_review.json",
    "utf8"
  )
);

const reviewed = [];
for (let i = 0; ; i++) {
  const p = `scripts/output/v2t_batch_${i}_reviewed.json`;
  if (!fs.existsSync(p)) break;
  reviewed.push(...JSON.parse(fs.readFileSync(p, "utf8")));
}

if (reviewed.length !== before.length) {
  console.error("LENGTH_MISMATCH", reviewed.length, before.length);
  process.exit(1);
}

let bad = 0;
let explChanged = 0;
let enunciadoChanged = 0;
let unchanged = 0;
const samples = [];

for (let i = 0; i < before.length; i++) {
  const o = before[i];
  const r = reviewed[i];
  if (o.id !== r.id) {
    bad++;
    console.error("id order", o.id, r.id);
  }
  if (o.resposta_correta !== r.resposta_correta) {
    bad++;
    console.error("gabarito", o.id);
  }
  if (JSON.stringify(o.alternativas) !== JSON.stringify(r.alternativas)) {
    bad++;
    console.error("alts", o.id);
  }
  if ((o.part_id || "") !== (r.part_id || "")) {
    bad++;
    console.error("part", o.id);
  }

  const eCh =
    (o.explicacao_profunda || "") !== (r.explicacao_profunda || "");
  const uCh = (o.enunciado || "") !== (r.enunciado || "");
  if (eCh) explChanged++;
  if (uCh) enunciadoChanged++;
  if (!eCh && !uCh) unchanged++;

  if (samples.length < 5 && eCh) {
    samples.push({
      id: o.id,
      before: o.explicacao_profunda,
      after: r.explicacao_profunda,
    });
  }

  if ((r.explicacao_profunda || "").length < 160) {
    console.warn("short_expl", r.id, (r.explicacao_profunda || "").length);
  }
}

if (bad > 0) {
  console.error("bad=", bad);
  process.exit(1);
}

fs.writeFileSync(
  "src/data/questions_v2_traditional.json",
  JSON.stringify(reviewed, null, 2) + "\n"
);

if (fs.existsSync("v2/final/questions_v2_traditional.json")) {
  fs.writeFileSync(
    "v2/final/questions_v2_traditional.json",
    JSON.stringify(reviewed, null, 2) + "\n"
  );
  console.log("synced v2/final/questions_v2_traditional.json");
}

let md = `# Questions V2 traditional review report

## Cadeia UI

\`\`\`
Simulado track ccna-v2
  → getSimuladoPoolByTrack("ccna-v2") / pickSimuladoV2MixedSession
  → simuladoQuestionsV2 = v2TraditionalQuestions (v2-banks.ts)
  → src/data/questions_v2_traditional.json

Estudo track ccna-v2
  → getPartQuestions(partId) / getV2TraditionalByPart
  → mesmo banco questions_v2_traditional.json
\`\`\`

| Métrica | Valor |
|---------|-------|
| Total no pool | ${reviewed.length} |
| Explicações reescritas | ${explChanged} |
| Enunciados só OCR / ajuste leve | ${enunciadoChanged} |
| Inalteradas (expl+enunciado) | ${unchanged} |
| bad gabarito | 0 |

## Amostras — explicação (antes → depois)

`;

for (const s of samples) {
  md += `### ID ${s.id}
**Antes:** ${s.before}

**Depois:** ${s.after}

`;
}

md += `## Invariantes

- \`resposta_correta\` e texto das \`alternativas\` preservados em 100%.
- Enunciados NÃO traduzidos EN→PT (só OCR óbvio se houver).
- Backup: \`scripts/output/questions_v2_traditional_before_review.json\`
`;

fs.writeFileSync(
  "scripts/output/questions_v2_traditional_review_report.md",
  md
);
console.log({
  total: reviewed.length,
  explChanged,
  enunciadoChanged,
  unchanged,
  bad: 0,
});
console.log(md.slice(0, 2000));
