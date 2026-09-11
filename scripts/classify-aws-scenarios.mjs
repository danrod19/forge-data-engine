import fs from "fs";

const q = JSON.parse(
  fs.readFileSync("src/data/questions_aws_traditional.json", "utf8")
);

const richRe =
  /multi-?az|rpo|rto|vpc|compliance|custo|cost|lat[eê]ncia|latency|disponib|availability|encrypt|criptograf|managed|gerenciad|serverless|sem servidor|usu[aá]rios|users|throughput|HA |failover|least privilege|restric|requisito/i;
const dryRe =
  /^(Qual |O que |Quando |Por que |Como |Which |What )/i;
const short = (e) => (e || "").length < 120;
const noConstraint = (e) =>
  !/(custo|cost|sem |sem servidor|VPC|encrypt|criptograf|managed|gerenciado|RPO|RTO|multi-?AZ|compliance|least privilege|n[aã]o pode|must not|cannot|only|apenas)/i.test(
    e || ""
  );

const scored = q.map((item, idx) => {
  const e = item.enunciado || "";
  let score = 0;
  const reasons = [];
  if (short(e)) {
    score += 3;
    reasons.push("short");
  }
  if (dryRe.test(e.trim()) && e.length < 140) {
    score += 2;
    reasons.push("dry_open");
  }
  if (noConstraint(e)) {
    score += 2;
    reasons.push("no_constraint");
  }
  if (!richRe.test(e)) {
    score += 1;
    reasons.push("no_rich_kw");
  }
  if ((item.explicacao_profunda || "").length < 80) {
    score += 2;
    reasons.push("thin_expl");
  }
  return {
    idx,
    id: item.id,
    score,
    reasons,
    len: e.length,
    expl: (item.explicacao_profunda || "").length,
    e: e.slice(0, 110),
  };
});

scored.sort((a, b) => b.score - a.score || a.len - b.len);

const priority = scored.filter((s) => s.score >= 5);
const mid = scored.filter((s) => s.score >= 3 && s.score < 5);
const okish = scored.filter((s) => s.score < 3);

console.log(
  JSON.stringify(
    {
      total: q.length,
      priority_ge5: priority.length,
      mid_3_4: mid.length,
      okish_lt3: okish.length,
      avg_len: Math.round(
        q.reduce((a, x) => a + (x.enunciado || "").length, 0) / q.length
      ),
      top60: priority.slice(0, 60).map((s) => ({
        id: s.id,
        idx: s.idx,
        score: s.score,
        reasons: s.reasons.join("+"),
        len: s.len,
      })),
      sample_priority: priority.slice(0, 5),
      sample_okish: okish.slice(0, 3),
    },
    null,
    2
  )
);

fs.writeFileSync(
  "scripts/output/aws_scenarios_priority_ids.json",
  JSON.stringify(
    {
      criterion: "score>=5 preferred; top 60 by score then short len",
      ids: priority.slice(0, 60).map((s) => s.id),
      indexes: priority.slice(0, 60).map((s) => s.idx),
      detail: priority.slice(0, 60),
    },
    null,
    2
  )
);
console.log("wrote scripts/output/aws_scenarios_priority_ids.json");
