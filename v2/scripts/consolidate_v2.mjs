/**
 * consolidate_v2.mjs
 * Inventário + validação + merge/dedupe/reindex das parts v2.
 * Não modifica v2/parts/. Saída em v2/final/.
 *
 * Uso: node v2/scripts/consolidate_v2.mjs
 * (cwd = raiz do repo ccna)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const V2_ROOT = path.resolve(__dirname, "..");
const PARTS_DIR = path.join(V2_ROOT, "parts");
const FINAL_DIR = path.join(V2_ROOT, "final");

const EXPECTED_PARTS = [
  "5.1",
  "5.2",
  "1.1",
  "4.4",
  "1.7",
  "1.6",
  "2.2",
  "2.4",
  "3.3",
  "4.7",
  "4.2",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function listPartFiles() {
  if (!fs.existsSync(PARTS_DIR)) {
    throw new Error(`Parts dir not found: ${PARTS_DIR}`);
  }
  return fs
    .readdirSync(PARTS_DIR)
    .filter((f) => f.endsWith(".json") && f.startsWith("part-v2-"))
    .sort();
}

function parsePartKey(filename) {
  // part-v2-5.1-content.json → { id: "5.1", kind: "content" }
  const m = filename.match(/^part-v2-(\d+\.\d+)-(content|questions|tickets)\.json$/);
  if (!m) return null;
  return { id: m[1], kind: m[2], part_id: `v2-${m[1]}` };
}

function normalizeEnunciado(text, max = 160) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeSintoma(text, max = 120) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function countUsefulCliLines(cli) {
  return String(cli ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;
}

function validateTraditional(q, sourceFile) {
  const reasons = [];
  if (q.question_type !== "traditional") {
    reasons.push(`question_type=${JSON.stringify(q.question_type)}`);
  }
  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) {
    reasons.push(
      `alternativas.length=${Array.isArray(q.alternativas) ? q.alternativas.length : "n/a"}`
    );
  }
  if (
    typeof q.resposta_correta !== "number" ||
    q.resposta_correta < 0 ||
    q.resposta_correta > 3 ||
    !Number.isInteger(q.resposta_correta)
  ) {
    reasons.push(`resposta_correta=${JSON.stringify(q.resposta_correta)}`);
  }
  if (!String(q.enunciado ?? "").trim()) reasons.push("enunciado vazio");
  const exp = String(q.explicacao_profunda ?? "").trim();
  if (!exp) reasons.push("explicacao_profunda vazia");
  else if (exp.length < 80) reasons.push(`explicacao_profunda len=${exp.length}<80`);
  if (!String(q.part_id ?? "").trim()) reasons.push("part_id ausente");
  if (typeof q.isPremium !== "boolean") {
    reasons.push(`isPremium type=${typeof q.isPremium}`);
  }
  return {
    ok: reasons.length === 0,
    reasons,
    sourceFile,
    part_id: q.part_id,
    local_id: q.id,
  };
}

function validateTicket(t, sourceFile) {
  const reasons = [];
  if (t.question_type !== "ticket") {
    reasons.push(`question_type=${JSON.stringify(t.question_type)}`);
  }
  if (!String(t.sintoma ?? "").trim()) reasons.push("sintoma vazio");
  const cliLines = countUsefulCliLines(t.cli_output);
  if (!String(t.cli_output ?? "").trim()) reasons.push("cli_output vazio");
  else if (cliLines < 6) reasons.push(`cli_output linhas_uteis=${cliLines}<6`);
  if (!Array.isArray(t.alternativas) || t.alternativas.length !== 4) {
    reasons.push(
      `alternativas.length=${Array.isArray(t.alternativas) ? t.alternativas.length : "n/a"}`
    );
  }
  if (
    typeof t.resposta_correta !== "number" ||
    t.resposta_correta < 0 ||
    t.resposta_correta > 3 ||
    !Number.isInteger(t.resposta_correta)
  ) {
    reasons.push(`resposta_correta=${JSON.stringify(t.resposta_correta)}`);
  }
  const exp = String(t.explicacao_profunda ?? "").trim();
  if (!exp) reasons.push("explicacao_profunda vazia");
  else if (exp.length < 80) reasons.push(`explicacao_profunda len=${exp.length}<80`);
  if (!String(t.part_id ?? "").trim()) reasons.push("part_id ausente");
  if (t.isPremium !== true) reasons.push(`isPremium=${JSON.stringify(t.isPremium)} (esperado true)`);
  return {
    ok: reasons.length === 0,
    reasons,
    sourceFile,
    part_id: t.part_id,
    local_id: t.id,
    cliLines,
  };
}

function main() {
  const files = listPartFiles();
  const contentFiles = files.filter((f) => f.endsWith("-content.json"));
  const questionFiles = files.filter((f) => f.endsWith("-questions.json"));
  const ticketFiles = files.filter((f) => f.endsWith("-tickets.json"));

  const byPart = {};
  for (const f of files) {
    const meta = parsePartKey(f);
    if (!meta) continue;
    if (!byPart[meta.id]) {
      byPart[meta.id] = {
        id: meta.id,
        part_id: meta.part_id,
        content: null,
        questions: null,
        tickets: null,
        questions_count: 0,
        tickets_count: 0,
      };
    }
    byPart[meta.id][meta.kind] = f;
  }

  // Inventory counts per part
  const inventoryParts = [];
  for (const id of Object.keys(byPart).sort((a, b) => {
    const [am, as] = a.split(".").map(Number);
    const [bm, bs] = b.split(".").map(Number);
    return am - bm || as - bs;
  })) {
    const p = byPart[id];
    let qCount = 0;
    let tCount = 0;
    if (p.questions) {
      const arr = readJson(path.join(PARTS_DIR, p.questions));
      qCount = Array.isArray(arr) ? arr.length : 0;
    }
    if (p.tickets) {
      const arr = readJson(path.join(PARTS_DIR, p.tickets));
      tCount = Array.isArray(arr) ? arr.length : 0;
    }
    p.questions_count = qCount;
    p.tickets_count = tCount;
    inventoryParts.push({
      part_key: id,
      part_id: p.part_id,
      has_content: Boolean(p.content),
      has_questions: Boolean(p.questions),
      has_tickets: Boolean(p.tickets),
      questions_count: qCount,
      tickets_count: tCount,
      files: {
        content: p.content,
        questions: p.questions,
        tickets: p.tickets,
      },
    });
  }

  const inventory = {
    generated_at: new Date().toISOString(),
    parts_dir: "v2/parts",
    files_total: files.length,
    content_files: contentFiles.length,
    questions_files: questionFiles.length,
    tickets_files: ticketFiles.length,
    parts_expected: EXPECTED_PARTS,
    parts_found_keys: inventoryParts.map((p) => p.part_key),
    missing_expected: EXPECTED_PARTS.filter(
      (k) => !inventoryParts.some((p) => p.part_key === k)
    ),
    extra_parts: inventoryParts
      .map((p) => p.part_key)
      .filter((k) => !EXPECTED_PARTS.includes(k)),
    parts: inventoryParts,
    totals_raw: {
      questions: inventoryParts.reduce((s, p) => s + p.questions_count, 0),
      tickets: inventoryParts.reduce((s, p) => s + p.tickets_count, 0),
    },
  };
  writeJson(path.join(FINAL_DIR, "inventory_report.json"), inventory);

  // Validate + collect
  const rejected = [];
  const validTraditional = [];
  const validTickets = [];

  for (const p of inventoryParts) {
    if (p.has_questions) {
      const arr = readJson(path.join(PARTS_DIR, p.files.questions));
      if (!Array.isArray(arr)) {
        rejected.push({
          kind: "traditional",
          sourceFile: p.files.questions,
          reason: "arquivo não é array",
        });
      } else {
        for (const q of arr) {
          const v = validateTraditional(q, p.files.questions);
          if (v.ok) validTraditional.push(q);
          else {
            rejected.push({
              kind: "traditional",
              sourceFile: v.sourceFile,
              part_id: v.part_id,
              local_id: v.local_id,
              reasons: v.reasons,
              enunciado_preview: String(q.enunciado ?? "").slice(0, 80),
            });
          }
        }
      }
    }
    if (p.has_tickets) {
      const arr = readJson(path.join(PARTS_DIR, p.files.tickets));
      if (!Array.isArray(arr)) {
        rejected.push({
          kind: "ticket",
          sourceFile: p.files.tickets,
          reason: "arquivo não é array",
        });
      } else {
        for (const t of arr) {
          const v = validateTicket(t, p.files.tickets);
          if (v.ok) validTickets.push(t);
          else {
            rejected.push({
              kind: "ticket",
              sourceFile: v.sourceFile,
              part_id: v.part_id,
              local_id: v.local_id,
              reasons: v.reasons,
              sintoma_preview: String(t.sintoma ?? "").slice(0, 80),
            });
          }
        }
      }
    }
  }

  const tradBeforeFilter = inventory.totals_raw.questions;
  const tickBeforeFilter = inventory.totals_raw.tickets;
  const tradRejected = rejected.filter((r) => r.kind === "traditional").length;
  const tickRejected = rejected.filter((r) => r.kind === "ticket").length;

  // Dedupe traditional
  const seenEnun = new Set();
  const tradDeduped = [];
  let tradDupRemoved = 0;
  for (const q of validTraditional) {
    const key = normalizeEnunciado(q.enunciado, 160);
    if (!key || seenEnun.has(key)) {
      tradDupRemoved++;
      continue;
    }
    seenEnun.add(key);
    tradDeduped.push(q);
  }

  // Dedupe tickets
  const seenSint = new Set();
  const tickDeduped = [];
  let tickDupRemoved = 0;
  for (const t of validTickets) {
    const key = normalizeSintoma(t.sintoma, 120);
    if (!key || seenSint.has(key)) {
      tickDupRemoved++;
      continue;
    }
    seenSint.add(key);
    tickDeduped.push(t);
  }

  // Reindex
  const traditionalFinal = tradDeduped.map((q, i) => ({
    ...q,
    id: i + 1,
    question_type: "traditional",
  }));

  const ticketsFinal = tickDeduped.map((t, i) => ({
    ...t,
    id: i + 1,
    question_type: "ticket",
    isPremium: true,
  }));

  writeJson(
    path.join(FINAL_DIR, "questions_v2_traditional.json"),
    traditionalFinal
  );
  writeJson(path.join(FINAL_DIR, "tickets_v2.json"), ticketsFinal);

  // parts_index from contents
  const partsIndex = [];
  for (const p of inventoryParts) {
    if (!p.has_content) continue;
    const content = readJson(path.join(PARTS_DIR, p.files.content));
    const qForPart = traditionalFinal.filter(
      (q) => q.part_id === content.part_id || q.part_id === p.part_id
    ).length;
    const tForPart = ticketsFinal.filter(
      (t) => t.part_id === content.part_id || t.part_id === p.part_id
    ).length;
    partsIndex.push({
      part_id: content.part_id ?? p.part_id,
      title: content.title ?? "",
      blueprint_module: content.blueprint_module ?? "",
      blueprint_topics: content.blueprint_topics ?? [],
      verb: content.verb ?? "",
      weight_percent: content.weight_percent ?? null,
      questions_count: qForPart,
      tickets_count: tForPart,
      content_path: `v2/parts/${p.files.content}`,
    });
  }
  writeJson(path.join(FINAL_DIR, "parts_index.json"), partsIndex);

  const freeCount = traditionalFinal.filter((q) => q.isPremium === false).length;
  const proCount = traditionalFinal.filter((q) => q.isPremium === true).length;

  const report = {
    generated_at: new Date().toISOString(),
    script: "v2/scripts/consolidate_v2.mjs",
    parts_found: inventoryParts.map((p) => p.part_id),
    parts_found_keys: inventoryParts.map((p) => p.part_key),
    parts_count: inventoryParts.length,
    inventory_summary: {
      content_files: contentFiles.length,
      questions_files: questionFiles.length,
      tickets_files: ticketFiles.length,
      raw_questions: tradBeforeFilter,
      raw_tickets: tickBeforeFilter,
    },
    traditional: {
      before_filter: tradBeforeFilter,
      after_filter: validTraditional.length,
      rejected: tradRejected,
      deduped_removed: tradDupRemoved,
      final_count: traditionalFinal.length,
    },
    tickets: {
      before_filter: tickBeforeFilter,
      after_filter: validTickets.length,
      rejected: tickRejected,
      deduped_removed: tickDupRemoved,
      final_count: ticketsFinal.length,
    },
    reject_samples: rejected.slice(0, 10),
    reject_total: rejected.length,
    free_vs_premium: {
      free: freeCount,
      premium: proCount,
      free_plus_premium: freeCount + proCount,
    },
    outputs: [
      "v2/final/inventory_report.json",
      "v2/final/questions_v2_traditional.json",
      "v2/final/tickets_v2.json",
      "v2/final/parts_index.json",
      "v2/final/consolidation_report.json",
    ],
    samples: {
      traditional:
        traditionalFinal[0]
          ? {
              id: traditionalFinal[0].id,
              part_id: traditionalFinal[0].part_id,
              enunciado: String(traditionalFinal[0].enunciado).slice(0, 100),
            }
          : null,
      ticket:
        ticketsFinal[0]
          ? {
              id: ticketsFinal[0].id,
              part_id: ticketsFinal[0].part_id,
              sintoma: String(ticketsFinal[0].sintoma).slice(0, 100),
            }
          : null,
    },
    parts_untouched: true,
    confirmation: "v2/parts/ não foi modificado",
  };

  writeJson(path.join(FINAL_DIR, "consolidation_report.json"), report);

  console.log(
    JSON.stringify(
      {
        ok: true,
        parts: report.parts_count,
        traditional_final: report.traditional.final_count,
        traditional_rejected: report.traditional.rejected,
        traditional_deduped: report.traditional.deduped_removed,
        tickets_final: report.tickets.final_count,
        tickets_rejected: report.tickets.rejected,
        tickets_deduped: report.tickets.deduped_removed,
        free: freeCount,
        premium: proCount,
      },
      null,
      2
    )
  );
}

main();
