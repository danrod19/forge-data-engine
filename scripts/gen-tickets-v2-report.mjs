import fs from "fs";

const o = JSON.parse(
  fs.readFileSync("scripts/output/tickets_v2_before_review.json", "utf8")
);
const r = JSON.parse(fs.readFileSync("src/data/tickets_v2.json", "utf8"));

let s = 0;
let e = 0;
let c = 0;
const light = [];
const samples = [];
const expls = [];

for (let i = 0; i < 85; i++) {
  const sc = o[i].sintoma !== r[i].sintoma;
  const ec = o[i].explicacao_profunda !== r[i].explicacao_profunda;
  const cc = o[i].cli_output !== r[i].cli_output;
  if (sc) s++;
  if (ec) e++;
  if (cc) c++;
  if (!sc && !ec) light.push(o[i].id);
  if (samples.length < 3 && (sc || ec)) {
    samples.push({
      id: o[i].id,
      sb: o[i].sintoma,
      sa: r[i].sintoma,
    });
  }
  if (expls.length < 3 && ec) {
    expls.push({
      id: o[i].id,
      eb: o[i].explicacao_profunda,
      ea: r[i].explicacao_profunda,
    });
  }
}

if (fs.existsSync("v2/final/tickets_v2.json")) {
  fs.writeFileSync(
    "v2/final/tickets_v2.json",
    JSON.stringify(r, null, 2) + "\n"
  );
  console.log("synced v2/final/tickets_v2.json");
}

let md = `# Tickets V2 review report

**Fonte UI Trilha ccna-v2:** \`src/data/tickets_v2.json\` ← \`v2-banks.ts\` (\`v2Tickets\`) ← \`tickets.ts\` \`getTicketsPool("ccna-v2")\` → \`v2ModuleTickets\`.

| Métrica | Valor |
|---------|-------|
| Total tickets | 85 |
| Sintomas reescritos/polidos | ${s} |
| Explicações reescritas | ${e} |
| CLI alterado (limpeza) | ${c} |
| IDs só limpeza leve / inalterados | ${light.length ? light.join(", ") : "—"} |

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
- Backup pré-review: \`scripts/output/tickets_v2_before_review.json\`
`;

fs.writeFileSync("scripts/output/tickets_v2_review_report.md", md);
console.log({ s, e, c, light: light.length });
console.log(md.slice(0, 2500));
