/**
 * Relatório de idioma (pt / en / mixed) por track.
 * Uso: npm run report:lang
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const PT_WORDS = [
  "qual",
  "quais",
  "quando",
  "onde",
  "como",
  "sobre",
  "rede",
  "redes",
  "configur",
  "endereço",
  "endereco",
  "após",
  "apos",
  "antes",
  "correto",
  "incorreto",
  "alternativa",
  "comando",
  "interface",
  "roteador",
  "comutador",
  "pacote",
  "quadro",
  "camada",
  "protocolo",
  "seguinte",
  "melhor",
  "deve",
  "precisa",
  "falha",
  "sintoma",
  "usuário",
  "usuario",
  "empresa",
  "cenário",
  "cenario",
  "arquitetura",
  "armazenamento",
  "segurança",
  "seguranca",
];

const EN_WORDS = [
  "which",
  "what",
  "when",
  "where",
  "how",
  "following",
  "command",
  "router",
  "switch",
  "address",
  "configure",
  "configuration",
  "correct",
  "incorrect",
  "packet",
  "frame",
  "layer",
  "protocol",
  "should",
  "must",
  "failure",
  "symptom",
  "customer",
  "company",
  "scenario",
  "architecture",
  "storage",
  "security",
  "network",
  "interface",
  "best",
  "describe",
  "based",
  "according",
];

const PT_CHAR_RE = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/;

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function countWordHits(text, words) {
  let hits = 0;
  for (const w of words) {
    if (text.includes(w)) hits += 1;
  }
  return hits;
}

function sourceText(q) {
  const parts = [
    q.enunciado || "",
    q.sintoma || "",
    ...(Array.isArray(q.alternativas) ? q.alternativas : []),
  ];
  return normalizeText(parts.join(" "));
}

function detectLang(q) {
  const text = sourceText(q);
  if (!text) return "mixed";
  const accentBonus = PT_CHAR_RE.test(text) ? 2 : 0;
  const ptHits = countWordHits(text, PT_WORDS) + accentBonus;
  const enHits = countWordHits(text, EN_WORDS);
  const STRONG = 2;
  if (ptHits >= STRONG && enHits >= STRONG) return "mixed";
  if (ptHits > enHits && ptHits >= 1) return "pt";
  if (enHits > ptHits && enHits >= 1) return "en";
  if (ptHits === enHits && ptHits >= 1) return "mixed";
  if (accentBonus > 0) return "pt";
  return "mixed";
}

function loadJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function classifyBank(name, list) {
  const buckets = { pt: [], en: [], mixed: [] };
  for (const q of list) {
    const lang = detectLang(q);
    const id = typeof q.id === "number" ? q.id : null;
    buckets[lang].push(id);
  }
  return {
    bank: name,
    total: list.length,
    pt: buckets.pt.length,
    en: buckets.en.length,
    mixed: buckets.mixed.length,
    sample_pt: buckets.pt.filter((x) => x != null).slice(0, 5),
    sample_en: buckets.en.filter((x) => x != null).slice(0, 5),
    sample_mixed: buckets.mixed.filter((x) => x != null).slice(0, 5),
  };
}

const tracks = {
  "ccna-v1": [
    ["traditional_final", "src/data/questions_traditional_FINAL.json"],
    ["module1_trad", "src/data/questions_module2_traditional.json"], // will add modules below
  ],
  "ccna-v2": [
    ["traditional", "src/data/questions_v2_traditional.json"],
    ["tickets", "src/data/tickets_v2.json"],
  ],
  aws: [
    ["traditional", "src/data/questions_aws_traditional.json"],
    ["tickets", "src/data/tickets_aws.json"],
  ],
};

// V1: curated = modules 1-6 traditional + tickets if present
const v1Banks = [
  ["m1_trad", null], // module1 is in module1-traditional.ts compiled from parts — use FINAL + module files
];

const report = {
  generated_at: new Date().toISOString(),
  mixed_rule:
    "Simulado Conhecimento (PT) = pt+mixed · Simulado Prova (EN) = en+mixed. Mixed entra nos dois modos.",
  tracks: {},
};

// CCNA V1 — FINAL + module 2-6 JSON (module1 lives in TS; also scan FINAL as volume proxy)
const v1Parts = [
  ["traditional_FINAL", "src/data/questions_traditional_FINAL.json"],
  ["module2_trad", "src/data/questions_module2_traditional.json"],
  ["module3_trad", "src/data/questions_module3_traditional.json"],
  ["module4_trad", "src/data/questions_module4_traditional.json"],
  ["module5_trad", "src/data/questions_module5_traditional.json"],
  ["module6_trad", "src/data/questions_module6_traditional.json"],
  ["tickets_all_merged", "src/data/tickets_all_merged.json"],
];

report.tracks["ccna-v1"] = {
  banks: v1Parts.map(([n, f]) => classifyBank(n, loadJson(f))),
};

report.tracks["ccna-v2"] = {
  banks: [
    classifyBank(
      "questions_v2_traditional",
      loadJson("src/data/questions_v2_traditional.json")
    ),
    classifyBank("tickets_v2", loadJson("src/data/tickets_v2.json")),
  ],
};

report.tracks.aws = {
  banks: [
    classifyBank(
      "questions_aws_traditional",
      loadJson("src/data/questions_aws_traditional.json")
    ),
    classifyBank("tickets_aws", loadJson("src/data/tickets_aws.json")),
  ],
};

// Rollups
for (const [trackId, block] of Object.entries(report.tracks)) {
  const roll = { pt: 0, en: 0, mixed: 0, total: 0 };
  for (const b of block.banks) {
    roll.pt += b.pt;
    roll.en += b.en;
    roll.mixed += b.mixed;
    roll.total += b.total;
  }
  block.rollup = roll;
}

const outDir = path.join(ROOT, "scripts", "output");
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, "question-lang-report.json");
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

let md = `# Question language report\n\nGenerated: ${report.generated_at}\n\n`;
md += `**Mixed rule:** ${report.mixed_rule}\n\n`;
for (const [trackId, block] of Object.entries(report.tracks)) {
  md += `## ${trackId}\n\n`;
  md += `| bucket | count |\n|--------|-------|\n`;
  md += `| pt | ${block.rollup.pt} |\n`;
  md += `| en | ${block.rollup.en} |\n`;
  md += `| mixed | ${block.rollup.mixed} |\n`;
  md += `| total | ${block.rollup.total} |\n\n`;
  for (const b of block.banks) {
    md += `### ${b.bank} (n=${b.total})\n`;
    md += `- pt ${b.pt} · samples: ${b.sample_pt.join(", ") || "—"}\n`;
    md += `- en ${b.en} · samples: ${b.sample_en.join(", ") || "—"}\n`;
    md += `- mixed ${b.mixed} · samples: ${b.sample_mixed.join(", ") || "—"}\n\n`;
  }
}
const mdPath = path.join(outDir, "question-lang-report.md");
fs.writeFileSync(mdPath, md);

console.log(md);
console.log(`\nWrote:\n- ${jsonPath}\n- ${mdPath}`);
