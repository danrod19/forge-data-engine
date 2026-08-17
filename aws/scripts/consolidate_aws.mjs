/**
 * consolidate_aws.mjs
 * Inventário + validação + merge/dedupe/reindex das parts AWS (SAA-C03).
 * Não modifica aws/parts/. Saída em aws/final/.
 *
 * Uso (cwd = raiz do repo ccna):
 *   node aws/scripts/consolidate_aws.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AWS_ROOT = path.resolve(__dirname, "..");
const PARTS_DIR = path.join(AWS_ROOT, "parts");
const FINAL_DIR = path.join(AWS_ROOT, "final");

const EXPECTED_PARTS = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.7",
  "1.8",
  "1.9",
  "1.10",
  "1.11",
  "1.12",
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
    .filter((f) => f.endsWith(".json") && f.startsWith("part-aws-"))
    .sort();
}

function parsePartKey(filename) {
  // part-aws-1.1-content.json → { id: "1.1", kind: "content", part_id: "aws-1.1" }
  const m = filename.match(
    /^part-aws-(\d+\.\d+)-(content|questions|tickets)\.json$/
  );
  if (!m) return null;
  return { id: m[1], kind: m[2], part_id: `aws-${m[1]}` };
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
  if (t.isPremium !== true) {
    reasons.push(`isPremium=${JSON.stringify(t.isPremium)} (esperado true)`);
  }
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
    track: "aws-saa-c03",
    parts_dir: "aws/parts",
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

  const traditionalFinal = tradDeduped.map((q, i) => ({
    ...q,
    id: i + 1,
    question_type: "traditional",
    source: q.source ?? "aws",
  }));

  const ticketsFinal = tickDeduped.map((t, i) => ({
    ...t,
    id: i + 1,
    question_type: "ticket",
    isPremium: true,
    source: t.source ?? "aws",
  }));

  writeJson(
    path.join(FINAL_DIR, "questions_aws_traditional.json"),
    traditionalFinal
  );
  writeJson(path.join(FINAL_DIR, "tickets_aws.json"), ticketsFinal);

  const partsIndex = [];
  for (const p of inventoryParts) {
    let title = p.part_id;
    let blueprint_module = "";
    let blueprint_topics = [];
    let verb = "";
    let weight_percent = 0;
    if (p.has_content) {
      try {
        const c = readJson(path.join(PARTS_DIR, p.files.content));
        title = c.title ?? title;
        blueprint_module = c.blueprint_module ?? "";
        blueprint_topics = Array.isArray(c.blueprint_topics)
          ? c.blueprint_topics
          : [];
        verb = c.verb ?? "";
        weight_percent = c.weight_percent ?? 0;
      } catch {
        /* keep defaults */
      }
    }
    const qInFinal = traditionalFinal.filter((q) => q.part_id === p.part_id)
      .length;
    const tInFinal = ticketsFinal.filter((t) => t.part_id === p.part_id).length;
    partsIndex.push({
      part_id: p.part_id,
      title,
      blueprint_module,
      blueprint_topics,
      verb,
      weight_percent,
      questions_count: qInFinal,
      tickets_count: tInFinal,
      content_path: p.files.content
        ? `aws/parts/${p.files.content}`
        : null,
    });
  }
  writeJson(path.join(FINAL_DIR, "parts_index.json"), partsIndex);

  const free = traditionalFinal.filter((q) => q.isPremium === false).length;
  const premium = traditionalFinal.filter((q) => q.isPremium === true).length;

  const report = {
    generated_at: new Date().toISOString(),
    script: "aws/scripts/consolidate_aws.mjs",
    track: "aws-saa-c03",
    parts_found: partsIndex.map((p) => p.part_id),
    parts_found_keys: inventoryParts.map((p) => p.part_key),
    parts_count: partsIndex.length,
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
    reject_samples: rejected.slice(0, 20),
    reject_total: rejected.length,
    free_vs_premium: {
      free,
      premium,
      free_plus_premium: free + premium,
    },
    outputs: [
      "aws/final/inventory_report.json",
      "aws/final/questions_aws_traditional.json",
      "aws/final/tickets_aws.json",
      "aws/final/parts_index.json",
      "aws/final/consolidation_report.json",
    ],
  };
  writeJson(path.join(FINAL_DIR, "consolidation_report.json"), report);

  console.log(
    JSON.stringify(
      {
        ok: true,
        track: "aws",
        parts: partsIndex.length,
        traditional_final: traditionalFinal.length,
        traditional_rejected: tradRejected,
        traditional_deduped: tradDupRemoved,
        tickets_final: ticketsFinal.length,
        tickets_rejected: tickRejected,
        tickets_deduped: tickDupRemoved,
        free,
        premium,
      },
      null,
      2
    )
  );
}

main();
