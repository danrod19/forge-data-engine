/**
 * Pre-AWS audit — read-only validation of v2 banks vs src/data.
 * Usage: node v2/scripts/_audit_pre_aws.mjs  (cwd = repo root)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const report = { phases: {}, issues: [], severity: [] };

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}
function sizeKB(p) {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return null;
  return Math.round((fs.statSync(full).size / 1024) * 10) / 10;
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
}

// ── FASE 1 ──────────────────────────────────────────────
const invFiles = [
  "v2/final/questions_v2_traditional.json",
  "v2/final/tickets_v2.json",
  "v2/final/parts_index.json",
  "v2/final/consolidation_report.json",
  "v2/final/inventory_report.json",
  "src/data/questions_v2_traditional.json",
  "src/data/tickets_v2.json",
  "src/data/parts_index_v2.json",
  "src/data/questions_traditional_FINAL.json",
  "src/data/tickets_unique.json",
  "src/data/tickets_from_bulk.json",
  "src/data/v2-banks.ts",
  "src/data/simulado-questions.ts",
  "src/data/tickets.ts",
  "src/data/estudo-module1.ts",
];
const inventory = invFiles.map((f) => ({
  path: f,
  ok: exists(f),
  kb: sizeKB(f),
}));

const partsDir = path.join(ROOT, "v2", "parts");
const partFiles = fs
  .readdirSync(partsDir)
  .filter((f) => f.startsWith("part-v2-") && f.endsWith(".json"));
const trios = { content: 0, questions: 0, tickets: 0 };
const partKeys = new Set();
for (const f of partFiles) {
  const m = f.match(/^part-v2-(\d+\.\d+)-(content|questions|tickets)\.json$/);
  if (!m) continue;
  partKeys.add(m[1]);
  trios[m[2]]++;
}
const completeTrios = [...partKeys].filter((k) => {
  return (
    partFiles.includes(`part-v2-${k}-content.json`) &&
    partFiles.includes(`part-v2-${k}-questions.json`) &&
    partFiles.includes(`part-v2-${k}-tickets.json`)
  );
}).sort((a, b) => {
  const [am, as] = a.split(".").map(Number);
  const [bm, bs] = b.split(".").map(Number);
  return am - bm || as - bs;
});

report.phases.inventory = {
  files: inventory,
  missing: inventory.filter((x) => !x.ok).map((x) => x.path),
  parts: {
    files_total: partFiles.length,
    content: trios.content,
    questions: trios.questions,
    tickets: trios.tickets,
    complete_trios: completeTrios.length,
    part_ids: completeTrios.map((k) => `v2-${k}`),
  },
};

// ── FASE 2 ──────────────────────────────────────────────
function validateTraditional(arr, label) {
  const flags = {
    empty_enunciado: [],
    short_enunciado: [],
    alts_bad: [],
    rc_bad: [],
    expl_short: [],
    type_bad: [],
    missing_part_id: [],
    id_not_number: [],
    isPremium_bad: [],
  };
  let free = 0;
  let pro = 0;
  if (!Array.isArray(arr) || arr.length === 0) {
    return { label, ok: false, count: 0, error: "not array or empty", flags, free, pro };
  }
  arr.forEach((q, i) => {
    if (typeof q.id !== "number") flags.id_not_number.push(i + 1);
    if (q.question_type !== "traditional") flags.type_bad.push({ i: i + 1, t: q.question_type });
    const en = String(q.enunciado ?? "");
    if (!en.trim()) flags.empty_enunciado.push(i + 1);
    else if (en.trim().length < 20) flags.short_enunciado.push(i + 1);
    if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) {
      flags.alts_bad.push(i + 1);
    }
    if (
      typeof q.resposta_correta !== "number" ||
      q.resposta_correta < 0 ||
      q.resposta_correta > 3 ||
      !Number.isInteger(q.resposta_correta)
    ) {
      flags.rc_bad.push(i + 1);
    }
    const exp = String(q.explicacao_profunda ?? "");
    if (exp.trim().length < 80) flags.expl_short.push(i + 1);
    if (!String(q.part_id ?? "").trim()) flags.missing_part_id.push(i + 1);
    if (typeof q.isPremium !== "boolean") flags.isPremium_bad.push(i + 1);
    if (q.isPremium === false) free++;
    else if (q.isPremium === true) pro++;
  });
  const issueCount = Object.values(flags).reduce((s, a) => s + a.length, 0);
  return {
    label,
    ok: issueCount === 0,
    count: arr.length,
    free,
    pro,
    issueCount,
    flags: Object.fromEntries(
      Object.entries(flags).filter(([, v]) => v.length > 0).map(([k, v]) => [k, { n: v.length, sample: v.slice(0, 5) }])
    ),
  };
}

function validateTickets(arr, label) {
  const flags = {
    type_bad: [],
    sintoma_short: [],
    cli_short: [],
    alts_bad: [],
    rc_bad: [],
    expl_short: [],
    missing_part_id: [],
    isPremium_not_true: [],
    id_not_number: [],
  };
  if (!Array.isArray(arr) || arr.length === 0) {
    return { label, ok: false, count: 0, error: "not array or empty", flags };
  }
  arr.forEach((t, i) => {
    if (typeof t.id !== "number") flags.id_not_number.push(i + 1);
    if (t.question_type !== "ticket") flags.type_bad.push(i + 1);
    if (String(t.sintoma ?? "").trim().length < 15) flags.sintoma_short.push(i + 1);
    if (String(t.cli_output ?? "").trim().length < 40) flags.cli_short.push(i + 1);
    if (!Array.isArray(t.alternativas) || t.alternativas.length !== 4) flags.alts_bad.push(i + 1);
    if (
      typeof t.resposta_correta !== "number" ||
      t.resposta_correta < 0 ||
      t.resposta_correta > 3 ||
      !Number.isInteger(t.resposta_correta)
    ) {
      flags.rc_bad.push(i + 1);
    }
    if (String(t.explicacao_profunda ?? "").trim().length < 80) flags.expl_short.push(i + 1);
    if (!String(t.part_id ?? "").trim()) flags.missing_part_id.push(i + 1);
    if (t.isPremium !== true) flags.isPremium_not_true.push(i + 1);
  });
  const issueCount = Object.values(flags).reduce((s, a) => s + a.length, 0);
  return {
    label,
    ok: issueCount === 0,
    count: arr.length,
    issueCount,
    flags: Object.fromEntries(
      Object.entries(flags).filter(([, v]) => v.length > 0).map(([k, v]) => [k, { n: v.length, sample: v.slice(0, 5) }])
    ),
  };
}

const qFinal = readJson("v2/final/questions_v2_traditional.json");
const qSrc = readJson("src/data/questions_v2_traditional.json");
const tFinal = readJson("v2/final/tickets_v2.json");
const tSrc = readJson("src/data/tickets_v2.json");
const idxFinal = readJson("v2/final/parts_index.json");
const idxSrc = readJson("src/data/parts_index_v2.json");

const qFinalV = validateTraditional(qFinal, "v2/final/questions");
const qSrcV = validateTraditional(qSrc, "src/data/questions");
const tFinalV = validateTickets(tFinal, "v2/final/tickets");
const tSrcV = validateTickets(tSrc, "src/data/tickets");

// sync check
const syncOk =
  qFinal.length === qSrc.length &&
  tFinal.length === tSrc.length &&
  idxFinal.length === idxSrc.length &&
  JSON.stringify(qFinal.map((x) => x.id)) === JSON.stringify(qSrc.map((x) => x.id)) &&
  JSON.stringify(tFinal.map((x) => x.id)) === JSON.stringify(tSrc.map((x) => x.id));

// dedupe stems traditional (src)
const stemMap = new Map();
for (const q of qSrc) {
  const stem = String(q.enunciado ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  if (!stem) continue;
  if (!stemMap.has(stem)) stemMap.set(stem, []);
  stemMap.get(stem).push({ id: q.id, part_id: q.part_id });
}
const exactDups = [...stemMap.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([stem, ids]) => ({ stem: stem.slice(0, 80), n: ids.length, ids: ids.slice(0, 6) }));

// ── FASE 3 ──────────────────────────────────────────────
const indexIds = new Set(idxSrc.map((p) => p.part_id));
const qPartIds = new Set(qSrc.map((q) => q.part_id).filter(Boolean));
const tPartIds = new Set(tSrc.map((t) => t.part_id).filter(Boolean));
const indexNoQ = [...indexIds].filter((id) => !qPartIds.has(id));
const indexNoT = [...indexIds].filter((id) => !tPartIds.has(id));
const qOrphans = [...qPartIds].filter((id) => !indexIds.has(id));
const tOrphans = [...tPartIds].filter((id) => !indexIds.has(id));

const perPart = idxSrc.map((p) => {
  const qc = qSrc.filter((q) => q.part_id === p.part_id).length;
  const tc = tSrc.filter((t) => t.part_id === p.part_id).length;
  return {
    part_id: p.part_id,
    title: p.title,
    index_q: p.questions_count,
    index_t: p.tickets_count,
    actual_q: qc,
    actual_t: tc,
    match: p.questions_count === qc && p.tickets_count === tc,
  };
});
const countMismatch = perPart.filter((p) => !p.match);

const expected = { parts: 17, q: 506, t: 85 };
const actual = {
  parts: idxSrc.length,
  q: qSrc.length,
  t: tSrc.length,
  free: qSrcV.free,
  pro: qSrcV.pro,
};
const divergence = {
  parts: actual.parts - expected.parts,
  q: actual.q - expected.q,
  t: actual.t - expected.t,
};

report.phases.schema = {
  sync_src_vs_final: syncOk,
  q_final: qFinalV,
  q_src: qSrcV,
  t_final: tFinalV,
  t_src: tSrcV,
  exact_stem_dups: { count: exactDups.length, samples: exactDups.slice(0, 10) },
};

report.phases.consistency = {
  index_parts: indexIds.size,
  distinct_q_parts: qPartIds.size,
  distinct_t_parts: tPartIds.size,
  index_without_questions: indexNoQ,
  index_without_tickets: indexNoT,
  q_orphans: qOrphans,
  t_orphans: tOrphans,
  count_mismatches: countMismatch,
  expected,
  actual,
  divergence,
  part_ids_index: [...indexIds].sort(),
};

// M1 presence
report.phases.m1 = {
  questions_traditional_FINAL: exists("src/data/questions_traditional_FINAL.json"),
  FINAL_kb: sizeKB("src/data/questions_traditional_FINAL.json"),
  FINAL_count: (() => {
    try {
      const a = readJson("src/data/questions_traditional_FINAL.json");
      return Array.isArray(a) ? a.length : "not-array";
    } catch {
      return "error";
    }
  })(),
  module1_traditional: exists("src/data/module1-traditional.ts"),
  module1_tickets: exists("src/data/module1-tickets.ts"),
  module_1_fundamentos: exists("src/data/module-1-fundamentos.ts"),
};

// Hardcoded count scan in src (ts/tsx)
const hardPatterns = [/\b185\b/g, /\b330\b/g, /\b477\b/g, /\b480\b/g];
const hardHits = [];
function walkSrc(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSrc(full);
    else if (/\.(ts|tsx)$/.test(ent.name)) {
      const text = fs.readFileSync(full, "utf8");
      // skip pure data json imports noise - only source
      for (const re of hardPatterns) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text))) {
          // context line
          const line = text.slice(0, m.index).split(/\r?\n/).length;
          const lineText = text.split(/\r?\n/)[line - 1]?.trim().slice(0, 100) || "";
          // ignore comments that mention historical only if in TASKS-like
          hardHits.push({
            file: path.relative(ROOT, full).replace(/\\/g, "/"),
            token: m[0],
            line,
            lineText,
          });
        }
      }
    }
  }
}
walkSrc(path.join(ROOT, "src"));

report.phases.hardcoded = hardHits.filter((h) => {
  // filter noise: ports, CSS opacity, etc. keep only suspicious count-like
  const lt = h.lineText.toLowerCase();
  if (lt.includes("opacity") || lt.includes("duration") || lt.includes("px")) return false;
  if (lt.includes("slice(") && h.token === "180") return false;
  // keep 185, 330, 477, 480 always
  return true;
});

console.log(JSON.stringify(report, null, 2));
