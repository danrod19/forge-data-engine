import fs from "fs";

const q = JSON.parse(
  fs.readFileSync("src/data/questions_aws_traditional.json", "utf8")
);

const metaRe =
  /fora de escopo|resumo |checklist mental|esta part reforça|nesta part|o que um |o que uma |qual diferença prática|qual checklist/i;
const richRe =
  /multi-?az|rpo|rto|vpc|compliance|custo|cost|lat[eê]ncia|latency|disponib|availability|encrypt|criptograf|managed|gerenciad|serverless|usu[aá]rios|throughput|failover|least privilege/i;

function scoreItem(item) {
  const e = item.enunciado || "";
  if (metaRe.test(e)) return { score: -1, reasons: ["meta"] };
  let score = 0;
  const reasons = [];
  if (e.length < 120) {
    score += 3;
    reasons.push("short");
  }
  if (
    /^(Qual |O que |Quando |Por que |Como |Which |What )/i.test(e.trim()) &&
    e.length < 140
  ) {
    score += 2;
    reasons.push("dry_open");
  }
  if (
    !/(custo|cost|sem servidor|VPC|encrypt|criptograf|managed|RPO|RTO|multi-?AZ|compliance|least privilege|n[aã]o pode|apenas|must |cannot)/i.test(
      e
    )
  ) {
    score += 2;
    reasons.push("no_constraint");
  }
  if (!richRe.test(e)) {
    score += 1;
    reasons.push("no_rich_kw");
  }
  return { score, reasons };
}

const ranked = q
  .map((item, idx) => {
    const s = scoreItem(item);
    return {
      idx,
      id: item.id,
      part_id: item.part_id,
      score: s.score,
      reasons: s.reasons,
      len: (item.enunciado || "").length,
      enunciado: item.enunciado,
      alternativas: item.alternativas,
      resposta_correta: item.resposta_correta,
      explicacao_profunda: item.explicacao_profunda,
    };
  })
  .filter((x) => x.score >= 5)
  .sort((a, b) => b.score - a.score || a.len - b.len);

// diversify across part_id: take round-robin up to 50
const byPart = new Map();
for (const item of ranked) {
  const k = item.part_id || "unk";
  if (!byPart.has(k)) byPart.set(k, []);
  byPart.get(k).push(item);
}
const parts = [...byPart.keys()].sort();
const selected = [];
let i = 0;
while (selected.length < 50 && parts.some((p) => byPart.get(p).length)) {
  const p = parts[i % parts.length];
  const bucket = byPart.get(p);
  if (bucket.length) selected.push(bucket.shift());
  i++;
}

const out = {
  selected_count: selected.length,
  criterion:
    "score>=5, exclude meta/study quiz, diversify by part_id, top ~50",
  ids: selected.map((s) => s.id),
  items: selected.map((s) => ({
    id: s.id,
    idx: s.idx,
    part_id: s.part_id,
    score: s.score,
    reasons: s.reasons,
    len: s.len,
    enunciado: s.enunciado,
    alternativas: s.alternativas,
    resposta_correta: s.resposta_correta,
    explicacao_profunda: s.explicacao_profunda,
  })),
};

fs.mkdirSync("scripts/output", { recursive: true });
fs.writeFileSync(
  "scripts/output/aws_scenarios_enrich_batch.json",
  JSON.stringify(out, null, 2)
);
console.log(
  JSON.stringify(
    {
      selected: selected.length,
      by_part: Object.fromEntries(
        [...byPart.entries()].map(([k, v]) => [
          k,
          selected.filter((s) => s.part_id === k).length,
        ])
      ),
      ids: selected.map((s) => s.id),
      samples: selected.slice(0, 8).map((s) => ({
        id: s.id,
        part: s.part_id,
        e: s.enunciado,
        rc: s.resposta_correta,
      })),
    },
    null,
    2
  )
);
