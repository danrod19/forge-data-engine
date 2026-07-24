/**
 * CCNA Forge — consolidate enriched batches into final quality-filtered banks.
 * No models / no Ollama. JSON-only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEN = __dirname;
// Project-level final/ deliverable (sibling of generated/)
const FINAL = path.join(__dirname, "..", "final");

const TEMPLATE_MARKERS = [
  "For this CCNA 200-301 item, the correct statement is",
  "The other options misstate the mechanism",
];

const EXHIBIT_RE = /refer to the\s*(exhibit|\.)/i;

function fixOcrResidual(s) {
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
  if (typeof obj === "string") return fixOcrResidual(obj);
  if (Array.isArray(obj)) return obj.map(deepOcr);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepOcr(v);
    return out;
  }
  return obj;
}

function normalizeKey(s, max = 180) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.:/\-]/g, "")
    .trim()
    .slice(0, max);
}

function loadAllBatches() {
  const files = fs
    .readdirSync(GEN)
    .filter((f) => f.endsWith("_enriched.json") && f.startsWith("lote_"))
    .sort();
  const rows = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(GEN, f), "utf8"));
    if (!Array.isArray(data)) continue;
    for (const row of data) {
      rows.push({ ...row, _source_file: f });
    }
  }
  return { files, rows };
}

function rejectTraditional(t) {
  if (!t || typeof t !== "object") return "missing";
  const expl = (t.explicacao_profunda || "").trim();
  const enun = (t.enunciado || "").trim();
  const alts = t.alternativas || [];

  if (alts.length < 4) return "alts_lt_4";
  if (expl.length < 80) return "expl_short";
  for (const m of TEMPLATE_MARKERS) {
    if (expl.includes(m)) return "template";
  }
  if (EXHIBIT_RE.test(enun)) {
    // no exhibit context attached in bulk traditional
    return "exhibit";
  }
  if (!enun) return "no_enunciado";
  return null;
}

function rejectTicket(t) {
  if (!t || typeof t !== "object") return "missing";
  if (!(t.sintoma || "").trim()) return "no_sintoma";
  if (!(t.cli_output || "").trim()) return "no_cli";
  if (!Array.isArray(t.alternativas) || t.alternativas.length < 4) return "alts_lt_4";
  if ((t.explicacao_profunda || "").trim().length <= 60) return "expl_short";
  return null;
}

function main() {
  if (!fs.existsSync(FINAL)) fs.mkdirSync(FINAL, { recursive: true });

  const { files, rows } = loadAllBatches();
  console.log("batches", files.length, files.join(", "));
  console.log("rows", rows.length);

  // --- traditional ---
  const tradRaw = [];
  for (const row of rows) {
    if (row.traditional) tradRaw.push(row.traditional);
  }
  const beforeTrad = tradRaw.length;

  const discards = {
    template: 0,
    exhibit: 0,
    expl_short: 0,
    alts_lt_4: 0,
    no_enunciado: 0,
    missing: 0,
    duplicate: 0,
  };

  const seenEnun = new Set();
  const tradOut = [];

  for (const raw of tradRaw) {
    let t = deepOcr({ ...raw });
    const reason = rejectTraditional(t);
    if (reason) {
      discards[reason] = (discards[reason] || 0) + 1;
      continue;
    }
    const key = normalizeKey(t.enunciado, 180);
    if (seenEnun.has(key)) {
      discards.duplicate++;
      continue;
    }
    seenEnun.add(key);
    const id = tradOut.length + 1;
    tradOut.push({
      id,
      question_type: "traditional",
      isPremium: true,
      enunciado: t.enunciado,
      alternativas: t.alternativas.slice(0, 4).map((a) => fixOcrResidual(String(a))),
      resposta_correta:
        typeof t.resposta_correta === "number" && t.resposta_correta >= 0 && t.resposta_correta <= 3
          ? t.resposta_correta
          : 0,
      explicacao_profunda: t.explicacao_profunda,
    });
  }

  // --- tickets ---
  const ticketRaw = [];
  for (const row of rows) {
    if (row.ticket) ticketRaw.push(row.ticket);
  }
  const beforeTickets = ticketRaw.length;
  const discardsT = {
    no_sintoma: 0,
    no_cli: 0,
    alts_lt_4: 0,
    expl_short: 0,
    missing: 0,
    duplicate: 0,
  };
  const seenSintoma = new Set();
  const ticketOut = [];

  for (const raw of ticketRaw) {
    let t = deepOcr({ ...raw });
    const reason = rejectTicket(t);
    if (reason) {
      discardsT[reason] = (discardsT[reason] || 0) + 1;
      continue;
    }
    const key = normalizeKey(t.sintoma, 180);
    if (seenSintoma.has(key)) {
      discardsT.duplicate++;
      continue;
    }
    seenSintoma.add(key);
    const id = ticketOut.length + 1;
    ticketOut.push({
      id,
      question_type: "ticket",
      isPremium: true,
      sintoma: t.sintoma,
      cli_output: t.cli_output,
      alternativas: t.alternativas.slice(0, 4).map((a) => fixOcrResidual(String(a))),
      resposta_correta:
        typeof t.resposta_correta === "number" && t.resposta_correta >= 0 && t.resposta_correta <= 3
          ? t.resposta_correta
          : 0,
      explicacao_profunda: t.explicacao_profunda,
    });
  }

  const tradPath = path.join(FINAL, "questions_traditional_enriched.json");
  const tickPath = path.join(FINAL, "tickets_from_bulk.json");
  fs.writeFileSync(tradPath, JSON.stringify(tradOut, null, 2));
  fs.writeFileSync(tickPath, JSON.stringify(ticketOut, null, 2));

  const report = {
    batches: files,
    traditional: {
      before: beforeTrad,
      after: tradOut.length,
      discarded: beforeTrad - tradOut.length,
      by_reason: discards,
      template_exhibit:
        (discards.template || 0) + (discards.exhibit || 0),
    },
    tickets: {
      before: beforeTickets,
      after: ticketOut.length,
      discarded: beforeTickets - ticketOut.length,
      by_reason: discardsT,
    },
    outputs: {
      traditional: tradPath,
      tickets: tickPath,
    },
    examples: {
      traditional: tradOut.slice(0, 2),
      tickets: ticketOut.slice(0, 2),
    },
  };

  fs.writeFileSync(
    path.join(FINAL, "consolidation_report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify(report, null, 2));
}

main();
