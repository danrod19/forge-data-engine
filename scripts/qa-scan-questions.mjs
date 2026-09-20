/**
 * Scanner de qualidade — bancos usados pelo app (e FINAL/unique pedidos).
 * Uso: node scripts/qa-scan-questions.mjs
 * Saída: scripts/qa-report.json
 */
import fs from "fs";
import path from "path";

const FILES = [
  {
    file: "src/data/parts",
    glob: /^part-.*-questions\.json$/,
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/questions_module2_traditional.json",
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/questions_module3_traditional.json",
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/questions_module4_traditional.json",
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/questions_module5_traditional.json",
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/questions_module6_traditional.json",
    track: "ccna-v1",
    type: "traditional",
  },
  {
    file: "src/data/parts",
    glob: /^part-.*-tickets\.json$/,
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/tickets_module2.json",
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/tickets_module3.json",
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/tickets_module4.json",
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/tickets_module5.json",
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/tickets_module6.json",
    track: "ccna-v1",
    type: "ticket",
  },
  {
    file: "src/data/questions_v2_traditional.json",
    track: "ccna-v2",
    type: "traditional",
  },
  {
    file: "src/data/tickets_v2.json",
    track: "ccna-v2",
    type: "ticket",
  },
  {
    file: "src/data/questions_aws_traditional.json",
    track: "aws",
    type: "traditional",
  },
  {
    file: "src/data/tickets_aws.json",
    track: "aws",
    type: "ticket",
  },
  {
    file: "src/data/questions_traditional_FINAL.json",
    track: "ccna-final",
    type: "traditional",
  },
  {
    file: "src/data/tickets_unique.json",
    track: "ccna-unique",
    type: "ticket",
  },
];

const HIGH = new Set([
  "stem_lt40",
  "stem_midword",
  "expl_missing",
  "cli_not_ios",
  "cli_json_http",
  "alts_count",
  "rc_oob",
  "id_empty",
  "exhibit_dead",
  "ocr",
]);

function lastToken(s) {
  return (s || "").trim().split(/\s+/).pop() || "";
}

function midWord(stem) {
  const t = (stem || "").trim();
  if (!t) return false;
  if (/[.!?]$/.test(t)) return false;
  const last = lastToken(t).replace(/[^A-Za-zÀ-ÿ0-9]/g, "");
  if (!last || last.length > 4) return false;
  if (!/[A-Za-zÀ-ÿ]$/.test(t)) return false;
  const ok = /^(id|AZ|HA|S3|EC2|VPC|ALB|ASG|RDS|SQS|SNS|KMS|IAM|NAT|ACL|QoS|API|DNS|WAN|LAN|OSPF|EIGRP|STP|VLAN|SVI|PoE|SSID|WLC|MX)$/i.test(
    last
  );
  return !ok;
}

function jsonPrimary(cli) {
  const t = cli || "";
  const first = t.slice(0, 220);
  const hits =
    (/\bcurl\b/i.test(t) ? 1 : 0) +
    (/HTTP\/1\.1/.test(t) ? 1 : 0) +
    (/application\/json/i.test(t) ? 1 : 0);
  if (hits === 0) return false;
  const iosFirst = /[A-Za-z][A-Za-z0-9_-]*(?:\([^)]+\))?#\s*(show|debug)/m.test(
    first
  );
  if (iosFirst && hits === 1) return false;
  return hits >= 2 || /^\s*(\$ )?curl\b/im.test(t) || /^\s*HTTP\/1\.1/m.test(t);
}

function flags(q, type, track) {
  const motivos = [];
  const stem = (
    type === "ticket" ? q.sintoma || q.enunciado || "" : q.enunciado || q.sintoma || ""
  ).trim();
  const expl = String(q.explicacao_profunda || "").trim();
  const cli = String(q.cli_output || "");
  const hay = `${stem}\n${expl}\n${cli}`;

  if (stem.length < 40) motivos.push("stem_lt40");
  if (midWord(stem)) motivos.push("stem_midword");
  if (!expl) motivos.push("expl_missing");
  else if (expl.length < 80) motivos.push("expl_lt80");
  if (
    /for this ccna/i.test(expl) ||
    /the other options misstate/i.test(expl) ||
    /correct choice:/i.test(expl) ||
    /for this item/i.test(expl)
  ) {
    motivos.push("expl_template");
  }

  if (type === "ticket" && track !== "aws") {
    const hasHost = /[A-Za-z][A-Za-z0-9_-]*(?:\([^)]+\))?#/.test(cli);
    const hasShow = /\b(show|debug)\b/i.test(cli);
    if (!hasHost || !hasShow) motivos.push("cli_not_ios");
    if (jsonPrimary(cli)) motivos.push("cli_json_http");
  }

  const alts = Array.isArray(q.alternativas) ? q.alternativas : [];
  if (alts.length !== 4) motivos.push("alts_count");
  const rc = q.resposta_correta;
  if (typeof rc !== "number" || rc < 0 || rc > 3 || rc >= alts.length) {
    motivos.push("rc_oob");
  }
  if (q.id === "" || q.id === "#" || q.id == null) motivos.push("id_empty");

  if (/refer to the exhibit/i.test(stem)) {
    const describes =
      /exhibit (shows|depicts|illustrates)|the (topology|figure|diagram) (shows|depicts)|no recorte|no diagrama|na figura|output (shows|below)/i.test(
        hay
      ) || (type === "ticket" && cli.length > 40);
    if (!describes) motivos.push("exhibit_dead");
  }

  if (
    /\bcongure\b/i.test(hay) ||
    /\boating\b/i.test(hay) ||
    /\bprex\b/i.test(hay) ||
    /\btrac\b/i.test(hay) ||
    /\bfififirewall\b/i.test(hay)
  ) {
    motivos.push("ocr");
  }

  if (!motivos.length) return null;
  const severity = motivos.some((m) => HIGH.has(m)) ? "high" : "med";
  return {
    id: q.id,
    part_id: q.part_id ?? null,
    track,
    type,
    motivos,
    severity,
    stem80: stem.slice(0, 80),
  };
}

function loadList(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.questions)) return raw.questions;
  return [];
}

const findings = [];
let seen = 0;
const checkpoints = [];

function scanFile(filePath, track, type) {
  const list = loadList(filePath);
  for (const q of list) {
    seen += 1;
    const f = flags(q, type, track);
    if (f) {
      f.file = filePath.replace(/\\/g, "/");
      findings.push(f);
    }
    if (seen % 100 === 0) {
      checkpoints.push({
        seen,
        high: findings.filter((x) => x.severity === "high").length,
        med: findings.filter((x) => x.severity === "med").length,
      });
      console.log(
        `checkpoint ${seen} high=${checkpoints.at(-1).high} med=${checkpoints.at(-1).med}`
      );
    }
  }
}

for (const spec of FILES) {
  const p = spec.file;
  if (spec.glob) {
    const dir = p;
    for (const name of fs.readdirSync(dir)) {
      if (!spec.glob.test(name)) continue;
      scanFile(path.join(dir, name), spec.track, spec.type);
    }
  } else if (fs.existsSync(p)) {
    scanFile(p, spec.track, spec.type);
  } else {
    console.warn("missing", p);
  }
}

const high = findings.filter((x) => x.severity === "high");
const med = findings.filter((x) => x.severity === "med");
const report = {
  generated_at: new Date().toISOString(),
  totals: { vistos: seen, high: high.length, med: med.length, flagged: findings.length },
  checkpoints,
  motivoCounts: findings.reduce((acc, f) => {
    for (const m of f.motivos) acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {}),
  findings,
};

fs.writeFileSync("scripts/qa-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ totals: report.totals, motivoCounts: report.motivoCounts }, null, 2));
console.log("wrote scripts/qa-report.json", findings.length, "findings");
