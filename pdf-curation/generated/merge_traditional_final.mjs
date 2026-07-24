/**
 * Merge traditional enriched + recovered → FINAL simulado bank.
 * JSON-only. No models.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FINAL = path.join(__dirname, "..", "final");

const BANNED = [
  "For this CCNA 200-301 item, the correct statement is",
  "The other options misstate the mechanism",
  "It matches the protocol or feature behavior described in the stem",
];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  const pairs = [
    [/flflooding/gi, "flooding"],
    [/fififirewall/gi, "firewall"],
    [/fifirewall/gi, "firewall"],
    [/conguration/gi, "configuration"],
    [/congurations/gi, "configurations"],
    [/congured/gi, "configured"],
    [/congures/gi, "configures"],
    [/conguring/gi, "configuring"],
    [/congure/gi, "configure"],
    [/\(cong\)/gi, "(config)"],
    [/\(cong-/gi, "(config-"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/specic/gi, "specific"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/\boods\b/gi, "floods"],
    [/ecient/gi, "efficient"],
    [/sucient/gi, "sufficient"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/dened/gi, "defined"],
    [/veries/gi, "verifies"],
    [/software-dened/gi, "software-defined"],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  return t;
}

function deepOcr(obj) {
  if (typeof obj === "string") return fixOcr(obj);
  if (Array.isArray(obj)) return obj.map(deepOcr);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepOcr(v);
    return out;
  }
  return obj;
}

function normalizeEnunciado(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.:/\-]/g, "")
    .trim()
    .slice(0, 180);
}

function load(name) {
  const p = path.join(FINAL, name);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!Array.isArray(data)) throw new Error(`Not array: ${name}`);
  return data;
}

function isValid(q) {
  if (!q || typeof q !== "object") return "missing";
  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) return "alts";
  if (typeof q.resposta_correta !== "number" || q.resposta_correta < 0 || q.resposta_correta > 3)
    return "answer_idx";
  const expl = (q.explicacao_profunda || "").trim();
  if (expl.length < 80) return "expl_short";
  for (const b of BANNED) {
    if (expl.includes(b)) return "banned";
  }
  if (!(q.enunciado || "").trim()) return "no_enunciado";
  return null;
}

function main() {
  const enriched = load("questions_traditional_enriched.json");
  const recovered = load("questions_traditional_recovered.json");
  const before = enriched.length + recovered.length;

  const combined = [...enriched, ...recovered].map((q) => deepOcr({ ...q }));

  const seen = new Set();
  const kept = [];
  let dups = 0;
  const rejected = { alts: 0, answer_idx: 0, expl_short: 0, banned: 0, no_enunciado: 0, missing: 0 };

  for (const q of combined) {
    const reason = isValid(q);
    if (reason) {
      rejected[reason] = (rejected[reason] || 0) + 1;
      continue;
    }
    const key = normalizeEnunciado(q.enunciado);
    if (seen.has(key)) {
      dups++;
      continue;
    }
    seen.add(key);
    kept.push(q);
  }

  // Prefer recovered quality if we ever hit same key from both: already first-wins.
  // Re-run with recovered first so recovered overwrites? User said concatenate then dedupe —
  // typically keep first. Enriched (511) first means recovered only adds new. Good.
  // If same stem exists in both, enriched wins (already quality). Recovered fills gaps.

  const final = kept.map((q, i) => ({
    id: i + 1,
    question_type: "traditional",
    isPremium: true,
    enunciado: fixOcr(String(q.enunciado).trim()),
    alternativas: q.alternativas.slice(0, 4).map((a) => fixOcr(String(a).trim())),
    resposta_correta: q.resposta_correta,
    explicacao_profunda: fixOcr(String(q.explicacao_profunda).trim()),
  }));

  // final pass validation
  let invalid = 0;
  for (const q of final) {
    if (isValid(q)) invalid++;
  }

  const outPath = path.join(FINAL, "questions_traditional_FINAL.json");
  fs.writeFileSync(outPath, JSON.stringify(final, null, 2));

  const report = {
    inputs: {
      enriched: enriched.length,
      recovered: recovered.length,
      concatenated: before,
    },
    dedupe: {
      duplicates_removed: dups,
      quality_rejected: rejected,
    },
    total_before_dedupe: before,
    total_final: final.length,
    invalid_after_reindex: invalid,
    output: outPath,
    examples: final.slice(0, 2),
  };

  fs.writeFileSync(path.join(FINAL, "merge_traditional_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
