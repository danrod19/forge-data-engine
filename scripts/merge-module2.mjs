import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const partsDir = path.join(root, "trilha-content", "parts");
const dataDir = path.join(root, "src", "data");

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

const parts = ["2.1", "2.2", "2.3", "2.4", "2.5"];

// traditional
let read = 0,
  invalid = 0,
  dups = 0;
const byPart = {};
const seen = new Set();
const out = [];
for (const p of parts) {
  const arr = JSON.parse(
    fs.readFileSync(path.join(partsDir, `part-${p}-questions.json`), "utf8")
  );
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
    const part = raw.part_id || "unknown";
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
  path.join(dataDir, "questions_module2_traditional.json"),
  JSON.stringify(out) + "\n"
);
console.log(
  "M2_TRAD",
  JSON.stringify({ read, invalid, dups, final: out.length, byPart })
);

// tickets
let tread = 0,
  tinvalid = 0,
  tdups = 0;
const tBy = {};
const tseen = new Set();
const tout = [];
for (const p of parts) {
  const arr = JSON.parse(
    fs.readFileSync(path.join(partsDir, `part-${p}-tickets.json`), "utf8")
  );
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
    const part = raw.part_id || "unknown";
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
  path.join(dataDir, "tickets_module2.json"),
  JSON.stringify(tout) + "\n"
);
console.log(
  "M2_TICK",
  JSON.stringify({
    read: tread,
    invalid: tinvalid,
    dups: tdups,
    final: tout.length,
    byPart: tBy,
  })
);

// merge traditional FINAL (compact JSON, no pretty)
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
  m2Added = 0,
  globalDups = 0;
for (const q of before) {
  if (pushTrad(q)) baseKept++;
  else globalDups++;
}
for (const q of out) {
  if (pushTrad(q)) m2Added++;
  else globalDups++;
}
fs.writeFileSync(finalPath, JSON.stringify(merged) + "\n");
console.log(
  "MERGE_TRAD",
  JSON.stringify({
    before: beforeN,
    after: merged.length,
    m2Added,
    globalDups,
    baseKept,
  })
);

// merge tickets unique+bulk+module2 → tickets_all_merged compact
const unique = JSON.parse(
  fs.readFileSync(path.join(dataDir, "tickets_unique.json"), "utf8")
);
const bulk = JSON.parse(
  fs.readFileSync(path.join(dataDir, "tickets_from_bulk.json"), "utf8")
);
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
let tM2 = 0,
  tDup = 0,
  tBase = 0;
for (const t of unique) {
  if (pushT(t)) tBase++;
  else tDup++;
}
for (const t of bulk) {
  if (pushT(t)) tBase++;
  else tDup++;
}
const legacyN = tMerged.length;
for (const t of tout) {
  if (pushT(t)) tM2++;
  else tDup++;
}
fs.writeFileSync(
  path.join(dataDir, "tickets_all_merged.json"),
  JSON.stringify(tMerged) + "\n"
);
console.log(
  "MERGE_TICK",
  JSON.stringify({
    beforeApprox: unique.length + bulk.length,
    after: tMerged.length,
    m2Added: tM2,
    dups: tDup,
    legacyKept: legacyN,
  })
);
console.log("DONE");
