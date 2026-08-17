import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const partsDir = path.join(root, "trilha-content", "parts");
const dataDir = path.join(root, "src", "data");
const appPartsDir = path.join(dataDir, "parts");

const norm = (t, max = 180) =>
  String(t || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const normS = (t, max = 180) =>
  String(t || "")
    .toLowerCase()
    .replace(/chamado\s*#?\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const parts = ["3.1", "3.2", "3.3", "3.4", "3.5"];

// ── traditional ──────────────────────────────────────────────
let read = 0,
  invalid = 0,
  dups = 0;
const byPart = {};
const seen = new Set();
const out = [];
for (const p of parts) {
  const fp = path.join(partsDir, `part-${p}-questions.json`);
  if (!fs.existsSync(fp)) {
    console.error("MISSING", fp);
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const raw of arr) {
    read++;
    const ok =
      raw.question_type === "traditional" &&
      Array.isArray(raw.alternativas) &&
      raw.alternativas.length === 4 &&
      raw.alternativas.every((a) => String(a || "").trim()) &&
      typeof raw.resposta_correta === "number" &&
      raw.resposta_correta >= 0 &&
      raw.resposta_correta <= 3 &&
      String(raw.enunciado || "").trim() &&
      String(raw.explicacao_profunda || "").trim();
    if (!ok) {
      invalid++;
      continue;
    }
    const key = norm(raw.enunciado);
    if (seen.has(key)) {
      dups++;
      continue;
    }
    seen.add(key);
    const part = raw.part_id || p;
    byPart[part] = (byPart[part] || 0) + 1;
    out.push({
      id: out.length + 1,
      question_type: "traditional",
      isPremium: !!raw.isPremium,
      enunciado: raw.enunciado,
      alternativas: raw.alternativas,
      resposta_correta: raw.resposta_correta,
      explicacao_profunda: raw.explicacao_profunda,
      part_id: part,
    });
  }
}
fs.writeFileSync(
  path.join(dataDir, "questions_module3_traditional.json"),
  JSON.stringify(out) + "\n"
);
console.log(
  "M3_TRAD",
  JSON.stringify({ read, invalid, dups, final: out.length, byPart })
);

// ── tickets ──────────────────────────────────────────────────
let tread = 0,
  tinvalid = 0,
  tdups = 0;
const tBy = {};
const tseen = new Set();
const tout = [];
for (const p of parts) {
  const fp = path.join(partsDir, `part-${p}-tickets.json`);
  if (!fs.existsSync(fp)) {
    console.error("MISSING", fp);
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const raw of arr) {
    tread++;
    const ok =
      raw.question_type === "ticket" &&
      String(raw.sintoma || "").trim() &&
      String(raw.cli_output || "").trim() &&
      Array.isArray(raw.alternativas) &&
      raw.alternativas.length === 4 &&
      raw.alternativas.every((a) => String(a || "").trim()) &&
      typeof raw.resposta_correta === "number" &&
      raw.resposta_correta >= 0 &&
      raw.resposta_correta <= 3 &&
      String(raw.explicacao_profunda || "").trim();
    if (!ok) {
      tinvalid++;
      continue;
    }
    const key = normS(raw.sintoma);
    if (tseen.has(key)) {
      tdups++;
      continue;
    }
    tseen.add(key);
    const part = raw.part_id || p;
    tBy[part] = (tBy[part] || 0) + 1;
    tout.push({
      id: tout.length + 1,
      question_type: "ticket",
      isPremium: raw.isPremium !== false,
      sintoma: raw.sintoma,
      cli_output: raw.cli_output,
      alternativas: raw.alternativas,
      resposta_correta: raw.resposta_correta,
      explicacao_profunda: raw.explicacao_profunda,
      part_id: part,
    });
  }
}
fs.writeFileSync(
  path.join(dataDir, "tickets_module3.json"),
  JSON.stringify(tout) + "\n"
);
console.log(
  "M3_TICK",
  JSON.stringify({
    read: tread,
    invalid: tinvalid,
    dups: tdups,
    final: tout.length,
    byPart: tBy,
  })
);

// ── merge traditional FINAL ──────────────────────────────────
const finalPath = path.join(dataDir, "questions_traditional_FINAL.json");
const before = JSON.parse(fs.readFileSync(finalPath, "utf8"));
const beforeN = before.length;
const gseen = new Set();
const merged = [];
function pushTrad(raw) {
  const enunciado = raw.enunciado || "";
  const key = norm(enunciado);
  if (!key || gseen.has(key)) return false;
  if (!Array.isArray(raw.alternativas) || raw.alternativas.length !== 4)
    return false;
  if (
    typeof raw.resposta_correta !== "number" ||
    raw.resposta_correta < 0 ||
    raw.resposta_correta > 3
  )
    return false;
  gseen.add(key);
  const item = {
    id: merged.length + 1,
    question_type: "traditional",
    isPremium: raw.isPremium ?? true,
    enunciado,
    alternativas: raw.alternativas,
    resposta_correta: raw.resposta_correta,
    explicacao_profunda: raw.explicacao_profunda || "",
  };
  if (raw.part_id) item.part_id = raw.part_id;
  merged.push(item);
  return true;
}
let baseKept = 0,
  m3Added = 0,
  globalDups = 0;
for (const q of before) {
  if (pushTrad(q)) baseKept++;
  else globalDups++;
}
for (const q of out) {
  if (pushTrad(q)) m3Added++;
  else globalDups++;
}
fs.writeFileSync(finalPath, JSON.stringify(merged) + "\n");
console.log(
  "MERGE_TRAD",
  JSON.stringify({
    before: beforeN,
    after: merged.length,
    m3Added,
    globalDups,
    baseKept,
  })
);

// ── merge tickets_all_merged ─────────────────────────────────
const allMergedPath = path.join(dataDir, "tickets_all_merged.json");
const prevAll = fs.existsSync(allMergedPath)
  ? JSON.parse(fs.readFileSync(allMergedPath, "utf8"))
  : [];
const unique = JSON.parse(
  fs.readFileSync(path.join(dataDir, "tickets_unique.json"), "utf8")
);
const bulk = JSON.parse(
  fs.readFileSync(path.join(dataDir, "tickets_from_bulk.json"), "utf8")
);
const m2 = fs.existsSync(path.join(dataDir, "tickets_module2.json"))
  ? JSON.parse(fs.readFileSync(path.join(dataDir, "tickets_module2.json"), "utf8"))
  : [];

const tSeen2 = new Set();
const tMerged = [];
function pushT(raw) {
  const key = normS(raw.sintoma || "");
  if (!key || tSeen2.has(key)) return false;
  if (!Array.isArray(raw.alternativas) || raw.alternativas.length !== 4)
    return false;
  tSeen2.add(key);
  const item = {
    id: tMerged.length + 1,
    question_type: "ticket",
    isPremium: raw.isPremium ?? true,
    sintoma: raw.sintoma || "",
    cli_output: raw.cli_output || "",
    alternativas: raw.alternativas,
    resposta_correta:
      typeof raw.resposta_correta === "number" ? raw.resposta_correta : 0,
    explicacao_profunda: raw.explicacao_profunda || "",
  };
  if (raw.part_id) item.part_id = raw.part_id;
  tMerged.push(item);
  return true;
}
let tBase = 0,
  tM2 = 0,
  tM3 = 0,
  tDup = 0;
for (const t of unique) {
  if (pushT(t)) tBase++;
  else tDup++;
}
for (const t of bulk) {
  if (pushT(t)) tBase++;
  else tDup++;
}
for (const t of m2) {
  if (pushT(t)) tM2++;
  else tDup++;
}
for (const t of tout) {
  if (pushT(t)) tM3++;
  else tDup++;
}
fs.writeFileSync(allMergedPath, JSON.stringify(tMerged) + "\n");
console.log(
  "MERGE_TICK",
  JSON.stringify({
    beforeAllMerged: prevAll.length,
    after: tMerged.length,
    legacyBase: tBase,
    m2Added: tM2,
    m3Added: tM3,
    dups: tDup,
  })
);

// ── copy part content JSON to src/data/parts ─────────────────
fs.mkdirSync(appPartsDir, { recursive: true });
for (const p of parts) {
  for (const kind of ["content", "questions", "tickets"]) {
    const src = path.join(partsDir, `part-${p}-${kind}.json`);
    const dst = path.join(appPartsDir, `part-${p}-${kind}.json`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }
}
console.log("COPIED_PARTS", parts.join(","));
console.log("DONE");
