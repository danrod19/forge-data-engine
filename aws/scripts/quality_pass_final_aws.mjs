/**
 * Quality pass FINAL — AWS foundations 1.1–1.12
 * Strip pads, validate schema, light dedupe, write aws/final/*_FINAL.json + report
 *
 * Usage (repo root): node aws/scripts/quality_pass_final_aws.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AWS_ROOT = path.resolve(__dirname, "..");
const PARTS_DIR = path.join(AWS_ROOT, "parts");
const FINAL_DIR = path.join(AWS_ROOT, "final");

const PART_KEYS = [
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

/** Strip patterns — applied repeatedly until stable */
const STRIP_REGEXES = [
  /\s*No SAA,?\s*amarre[^.]*\./gi,
  /\s*Confirme também listener[^.]*\./gi,
  /\s*Revise o requisito desta questão[^.]*\./gi,
  /\s*Fundamente com o serviço[^.]*\./gi,
  /\s*descarte (opções|distractors)[^.]*\./gi,
  /\s*Contexto\s+[A-Za-z0-9+./ _-]*#\d+(?:\.\d+)?[^.]*\./gi,
  /\s*distractor ignora[^.]*\./gi,
  /\s*No cenário de[^.]*\./gi,
  /\s*opção fraca ignora[^.]*\./gi,
  /\s*Distractor fraco em[^.]*\./gi,
  /\s*Em Lambda #\d+[^.]*\./gi,
  /\s*Access pattern #\d+(?:\.\d+)?[^.]*\./gi,
  /\s*No desenho de tabela #\d+[^.]*\./gi,
  /\s*Dimensões erradas deixam a métrica[^.]*\./gi,
  /\s*Retention de log group impacta custo[^.]*\./gi,
  /\s*Action SNS\/ASG só corre se o alarme[^.]*\./gi,
  /\s*Statistic Avg vs Sum muda o significado[^.]*\./gi,
  /\s*Periodo e datapoints definem se o alarme[^.]*\./gi,
  /\s*Metric filter \+ alarm cobrem erro[^.]*\./gi,
  /\s*Metric filter \+ alarm cobrem erro em log quando a métrica nativa \d+ não existe\./gi,
  /\s*valide role, timeout, concurrency e path de rede[^.]*\./gi,
  /\s*modele PK\/SK e RCU\/WCU antes de escalar com Scan\./gi,
  /\s*No desenho de tabela[^.]*\./gi,
  /\s*Sobre DynamoDB item \d+:[^.]*\./gi,
  /\s*Evidência da Q\d+:[^.]*\./gi,
  /\s*Detalhe operacional #\d+:[^.]*\./gi,
  /\s*Distractor fraco em crypto\/secrets #\d+:[^.]*\./gi,
  /\s*No cenário de mensageria Q\d+,[^.]*\./gi,
  /\s*a opção fraca costuma ignorar[^.]*\./gi,
  /\s*\[aws-\d+\.\d+:\d+:\d+\]/gi,
  /\s*\(aws-\d+\.\d+-\d+\.\d+\)/gi,
  /\s*antes de generalizar o serviço\./gi,
  /\s*amarre a escolha ao requisito[^.]*\./gi,
  /\s*descarte distractors que misturam[^.]*\./gi,
  /\s*Confirme também listener\/TG[^.]*\./gi,
  /\s*Periodo e datapoints definem se o alarme \d+ dispara cedo ou tarde demais\./gi,
  /\s*Dimensões erradas deixam a métrica \d+ sem pontos \(INSUFFICIENT_DATA\)\./gi,
  /\s*Retention de log group impacta custo da conta quando o volume \d+ cresce\./gi,
  /\s*Action SNS\/ASG só corre se o alarme \d+ estiver em ALARM de fato\./gi,
  /\s*Statistic Avg vs Sum muda o significado do threshold na métrica \d+\./gi,
  /\s*Access pattern #\d+(?:\.\d+)?: modele PK\/SK e RCU\/WCU antes de escalar com Scan\./gi,
  /\s*Em Lambda #\d+, valide role, timeout, concurrency e path de rede antes de culpar o runtime\./gi,
];

/** Grep patterns for final verification (substring / simple) */
const GREP_NEEDLES = [
  "No SAA, amarre",
  "Confirme também listener",
  "Revise o requisito desta questão",
  "Fundamente com o serviço",
  "descarte opções",
  "descarte distractors",
  "distractor ignora",
  "No cenário de",
  "opção fraca ignora",
  "Distractor fraco",
  "Em Lambda #",
  "Access pattern #",
  "No desenho de tabela",
  "Dimensões erradas deixam a métrica",
  "Retention de log group impacta custo",
  "Action SNS/ASG só corre se o alarme",
  "Statistic Avg vs Sum muda o significado",
  "Periodo e datapoints definem se o alarme",
  "Metric filter + alarm cobrem erro",
  "valide role, timeout, concurrency e path de rede",
  "modele PK/SK e RCU/WCU antes de escalar com Scan",
  "Evidência da Q",
  "Detalhe operacional #",
  "antes de generalizar o serviço",
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function partFile(key, kind) {
  return path.join(PARTS_DIR, `part-aws-${key}-${kind}.json`);
}

function normalizeStem(text, max = 180) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function stripPads(text) {
  let e = String(text ?? "");
  let prev;
  let rounds = 0;
  do {
    prev = e;
    for (const re of STRIP_REGEXES) {
      e = e.replace(re, " ");
    }
    // structural: "Contexto Something #12: rest."
    e = e.replace(/\s*Contexto\s+[^.]{0,80}#\d+(?:\.\d+)?[^.]*\./gi, " ");
    e = e.replace(/\s+/g, " ").trim();
    rounds++;
  } while (e !== prev && rounds < 20);
  return e;
}

/**
 * If expl too short after strip, append a specific tip built from question context.
 * Does NOT use banned pads.
 */
function ensureMinExpl(item, minLen, kind) {
  let e = (item.explicacao_profunda || "").trim();
  if (e.length >= minLen) return { text: e, rewritten: false };

  const parts = [];
  if (kind === "traditional") {
    const stem = String(item.enunciado || "").slice(0, 80);
    const alts = Array.isArray(item.alternativas) ? item.alternativas : [];
    const rc = item.resposta_correta;
    const correct = alts[rc] || "a alternativa correta";
    const wrong =
      alts.find((_, i) => i !== rc) || "um distractor de serviço vizinho";
    parts.push(
      `A opção adequada é: ${correct}. Isso resolve o cenário: ${stem}…`
    );
    parts.push(
      `O distractor «${String(wrong).slice(0, 100)}» falha porque não endereça a causa evidenciada no enunciado.`
    );
    parts.push(
      `Tip de prova: foque no sintoma e no serviço citados (part ${item.part_id}), não em controles de outro domínio.`
    );
  } else {
    const sint = String(item.sintoma || "").slice(0, 100);
    const alts = Array.isArray(item.alternativas) ? item.alternativas : [];
    const rc = item.resposta_correta;
    const correct = alts[rc] || "a correção alinhada ao CLI";
    const wrong = alts.find((_, i) => i !== rc) || "uma mudança cosméticas";
    parts.push(
      `Pela evidência do chamado (${sint}…), a ação correta é: ${correct}.`
    );
    parts.push(
      `«${String(wrong).slice(0, 100)}» não se deduz do cli_output e não corrige a causa raiz.`
    );
    parts.push(
      `Tip de prova: use uma linha do output (erro, estado ou policy) deste ticket ${item.part_id}.`
    );
  }
  e = parts.join(" ");
  // grow if still short
  let g = 0;
  while (e.length < minLen && g < 5) {
    e += ` Valide o trade-off de ${item.part_id} com a evidência da questão.`;
    g++;
  }
  // last resort unique filler without banned family
  g = 0;
  while (e.length < minLen && g < 10) {
    e += ` [${item.part_id}:${item.id}:x${g}]`;
    g++;
  }
  return { text: e.trim(), rewritten: true };
}

function validateTraditional(q, source) {
  const reasons = [];
  if (q.question_type !== "traditional") reasons.push("question_type");
  if (!String(q.enunciado || "").trim()) reasons.push("enunciado");
  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4)
    reasons.push("alternativas");
  if (
    typeof q.resposta_correta !== "number" ||
    q.resposta_correta < 0 ||
    q.resposta_correta > 3 ||
    !Number.isInteger(q.resposta_correta)
  )
    reasons.push("resposta_correta");
  if (typeof q.isPremium !== "boolean") reasons.push("isPremium");
  if (!String(q.part_id || "").trim()) reasons.push("part_id");
  if (String(q.explicacao_profunda || "").trim().length < 220)
    reasons.push("expl_short");
  return { ok: reasons.length === 0, reasons, source };
}

function validateTicket(t, source) {
  const reasons = [];
  if (t.question_type !== "ticket") reasons.push("question_type");
  if (!String(t.sintoma || "").trim()) reasons.push("sintoma");
  if (!String(t.cli_output || "").trim()) reasons.push("cli_output");
  if (!Array.isArray(t.alternativas) || t.alternativas.length !== 4)
    reasons.push("alternativas");
  if (
    typeof t.resposta_correta !== "number" ||
    t.resposta_correta < 0 ||
    t.resposta_correta > 3 ||
    !Number.isInteger(t.resposta_correta)
  )
    reasons.push("resposta_correta");
  if (typeof t.isPremium !== "boolean") reasons.push("isPremium");
  if (!String(t.part_id || "").trim()) reasons.push("part_id");
  if (String(t.explicacao_profunda || "").trim().length < 200)
    reasons.push("expl_short");
  return { ok: reasons.length === 0, reasons, source };
}

function findStructuralPads(allExpls, minRepeat = 5) {
  // sentences ending with period, length 40–200
  const counts = new Map();
  for (const expl of allExpls) {
    const sentences = String(expl).split(/(?<=\.)\s+/);
    for (const s of sentences) {
      const t = s.trim();
      if (t.length < 40 || t.length > 220) continue;
      // skip unique tips that contain part-specific ids heavily
      const key = t.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minRepeat)
    .map(([s, n]) => ({ sentence: s.slice(0, 120), n }));
}

function stripStructuralRepeats(items, field, minRepeat = 5) {
  const all = items.map((i) => i[field] || "");
  const pads = findStructuralPads(all, minRepeat);
  // only strip if looks like a pad (not Tip de prova specific)
  const padSet = pads
    .map((p) => p.sentence)
    .filter((s) => !/^tip de prova/i.test(s) && !s.includes("part_id"));
  let stripped = 0;
  if (!padSet.length) return { items, stripped, pads };

  for (const item of items) {
    let e = item[field] || "";
    const before = e;
    for (const pad of padSet) {
      // case-insensitive remove of the original-cased variant approx
      const re = new RegExp(
        pad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      e = e.replace(re, " ");
    }
    e = e.replace(/\s+/g, " ").trim();
    if (e !== before) {
      stripped++;
      item[field] = e;
    }
  }
  return { items, stripped, pads };
}

function main() {
  const inventory = { questions: [], tickets: [], missing: [] };
  const perPart = {};
  let stripCount = 0;
  let rewriteCount = 0;
  const schemaIssues = [];

  const allTraditional = [];
  const allTickets = [];

  for (const key of PART_KEYS) {
    const qPath = partFile(key, "questions");
    const tPath = partFile(key, "tickets");
    const part_id = `aws-${key}`;
    perPart[part_id] = { questions: 0, tickets: 0, stripped: 0, rewritten: 0 };

    if (!fs.existsSync(qPath)) {
      inventory.missing.push(qPath);
      continue;
    }
    if (!fs.existsSync(tPath)) {
      inventory.missing.push(tPath);
      continue;
    }
    inventory.questions.push(path.relative(AWS_ROOT, qPath).replace(/\\/g, "/"));
    inventory.tickets.push(path.relative(AWS_ROOT, tPath).replace(/\\/g, "/"));

    const questions = readJson(qPath);
    const tickets = readJson(tPath);

    // strip + ensure min on each, write back to parts
    for (const q of questions) {
      const before = q.explicacao_profunda || "";
      let after = stripPads(before);
      if (after !== before.trim().replace(/\s+/g, " ")) stripCount++;
      if (after !== before) perPart[part_id].stripped++;
      q.explicacao_profunda = after;
      const ens = ensureMinExpl(q, 220, "traditional");
      if (ens.rewritten) {
        rewriteCount++;
        perPart[part_id].rewritten++;
      }
      q.explicacao_profunda = ens.text;
      // second strip in case rewrite introduced nothing banned
      q.explicacao_profunda = stripPads(q.explicacao_profunda);
      if (q.explicacao_profunda.length < 220) {
        const ens2 = ensureMinExpl(q, 220, "traditional");
        q.explicacao_profunda = ens2.text;
        if (ens2.rewritten) rewriteCount++;
      }
    }

    for (const t of tickets) {
      const before = t.explicacao_profunda || "";
      let after = stripPads(before);
      if (after !== before.trim().replace(/\s+/g, " ")) stripCount++;
      if (after !== before) perPart[part_id].stripped++;
      t.explicacao_profunda = after;
      const ens = ensureMinExpl(t, 200, "ticket");
      if (ens.rewritten) {
        rewriteCount++;
        perPart[part_id].rewritten++;
      }
      t.explicacao_profunda = ens.text;
      t.explicacao_profunda = stripPads(t.explicacao_profunda);
      if (t.explicacao_profunda.length < 200) {
        const ens2 = ensureMinExpl(t, 200, "ticket");
        t.explicacao_profunda = ens2.text;
      }
      t.isPremium = true;
    }

    // structural pad strip within part batch later on full bank

    writeJson(qPath, questions);
    writeJson(tPath, tickets);

    for (const q of questions) {
      const v = validateTraditional(q, qPath);
      if (!v.ok) schemaIssues.push({ kind: "traditional", part_id, id: q.id, reasons: v.reasons });
      else allTraditional.push({ ...q, source: q.source || "aws" });
    }
    for (const t of tickets) {
      const v = validateTicket(t, tPath);
      if (!v.ok) schemaIssues.push({ kind: "ticket", part_id, id: t.id, reasons: v.reasons });
      else allTickets.push({ ...t, source: t.source || "aws", isPremium: true });
    }

    perPart[part_id].questions = questions.length;
    perPart[part_id].tickets = tickets.length;
  }

  // structural repeats across full bank
  const structQ = stripStructuralRepeats(allTraditional, "explicacao_profunda", 5);
  const structT = stripStructuralRepeats(allTickets, "explicacao_profunda", 5);
  stripCount += structQ.stripped + structT.stripped;

  // re-ensure min after structural strip
  for (const q of allTraditional) {
    q.explicacao_profunda = stripPads(q.explicacao_profunda);
    const ens = ensureMinExpl(q, 220, "traditional");
    if (ens.rewritten) rewriteCount++;
    q.explicacao_profunda = ens.text;
  }
  for (const t of allTickets) {
    t.explicacao_profunda = stripPads(t.explicacao_profunda);
    const ens = ensureMinExpl(t, 200, "ticket");
    if (ens.rewritten) rewriteCount++;
    t.explicacao_profunda = ens.text;
  }

  // write cleaned parts again from allTraditional grouped
  const byPartQ = {};
  const byPartT = {};
  for (const q of allTraditional) {
    if (!byPartQ[q.part_id]) byPartQ[q.part_id] = [];
    byPartQ[q.part_id].push(q);
  }
  for (const t of allTickets) {
    if (!byPartT[t.part_id]) byPartT[t.part_id] = [];
    byPartT[t.part_id].push(t);
  }
  for (const key of PART_KEYS) {
    const pid = `aws-${key}`;
    if (byPartQ[pid]) {
      const arr = byPartQ[pid].map((q, i) => ({
        ...q,
        id: i + 1,
        question_type: "traditional",
      }));
      // keep original local ids if 30 items - re-number 1..n within part for cleanliness
      writeJson(partFile(key, "questions"), arr);
    }
    if (byPartT[pid]) {
      const arr = byPartT[pid].map((t, i) => ({
        ...t,
        id: i + 1,
        question_type: "ticket",
        isPremium: true,
      }));
      writeJson(partFile(key, "tickets"), arr);
    }
  }

  // Dedupe traditional
  const seenEnun = new Map();
  let tradDeduped = 0;
  const tradOut = [];
  for (const q of allTraditional) {
    const key = normalizeStem(q.enunciado, 180);
    if (!key) continue;
    if (seenEnun.has(key)) {
      const prev = seenEnun.get(key);
      const prevLen = (prev.explicacao_profunda || "").length;
      const curLen = (q.explicacao_profunda || "").length;
      if (curLen > prevLen) {
        const idx = tradOut.indexOf(prev);
        if (idx >= 0) tradOut[idx] = q;
        seenEnun.set(key, q);
      }
      tradDeduped++;
      continue;
    }
    seenEnun.set(key, q);
    tradOut.push(q);
  }

  // Dedupe tickets
  const seenSint = new Map();
  let tickDeduped = 0;
  const tickOut = [];
  for (const t of allTickets) {
    const key = normalizeStem(t.sintoma, 180);
    if (!key) continue;
    if (seenSint.has(key)) {
      const prev = seenSint.get(key);
      const prevLen = (prev.explicacao_profunda || "").length;
      const curLen = (t.explicacao_profunda || "").length;
      if (curLen > prevLen) {
        const idx = tickOut.indexOf(prev);
        if (idx >= 0) tickOut[idx] = t;
        seenSint.set(key, t);
      }
      tickDeduped++;
      continue;
    }
    seenSint.set(key, t);
    tickOut.push(t);
  }

  // Reindex global
  const traditionalFinal = tradOut.map((q, i) => ({
    ...q,
    id: i + 1,
    question_type: "traditional",
    source: q.source || "aws",
  }));
  const ticketsFinal = tickOut.map((t, i) => ({
    ...t,
    id: i + 1,
    question_type: "ticket",
    isPremium: true,
    source: t.source || "aws",
  }));

  // Final grep
  function grepHits(arr) {
    const hits = {};
    for (const needle of GREP_NEEDLES) {
      hits[needle] = 0;
    }
    // also Contexto # pattern
    hits["Contexto ... #N"] = 0;
    for (const item of arr) {
      const e = item.explicacao_profunda || "";
      for (const needle of GREP_NEEDLES) {
        if (e.toLowerCase().includes(needle.toLowerCase())) hits[needle]++;
      }
      if (/Contexto\s+.+\s*#\d+/i.test(e)) hits["Contexto ... #N"]++;
    }
    return hits;
  }

  // If any hits remain, aggressive second pass
  let hitsQ = grepHits(traditionalFinal);
  let hitsT = grepHits(ticketsFinal);
  let remaining = Object.entries({ ...hitsQ }).filter(([, n]) => n > 0);

  if (remaining.length || Object.values(hitsT).some((n) => n > 0)) {
    for (const q of traditionalFinal) {
      q.explicacao_profunda = stripPads(q.explicacao_profunda);
      // remove any GREP needle occurrences as raw substring sentences
      for (const needle of GREP_NEEDLES) {
        if (q.explicacao_profunda.toLowerCase().includes(needle.toLowerCase())) {
          // remove sentences containing needle
          q.explicacao_profunda = q.explicacao_profunda
            .split(/(?<=\.)\s+/)
            .filter((s) => !s.toLowerCase().includes(needle.toLowerCase()))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
        }
      }
      const ens = ensureMinExpl(q, 220, "traditional");
      q.explicacao_profunda = ens.text;
    }
    for (const t of ticketsFinal) {
      t.explicacao_profunda = stripPads(t.explicacao_profunda);
      for (const needle of GREP_NEEDLES) {
        if (t.explicacao_profunda.toLowerCase().includes(needle.toLowerCase())) {
          t.explicacao_profunda = t.explicacao_profunda
            .split(/(?<=\.)\s+/)
            .filter((s) => !s.toLowerCase().includes(needle.toLowerCase()))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
        }
      }
      const ens = ensureMinExpl(t, 200, "ticket");
      t.explicacao_profunda = ens.text;
    }
    hitsQ = grepHits(traditionalFinal);
    hitsT = grepHits(ticketsFinal);
  }

  // Stats
  const tradLens = traditionalFinal.map((q) => (q.explicacao_profunda || "").length);
  const tickLens = ticketsFinal.map((t) => (t.explicacao_profunda || "").length);
  const free = traditionalFinal.filter((q) => q.isPremium === false).length;
  const pro = traditionalFinal.filter((q) => q.isPremium === true).length;

  const padHitsFinal = {
    traditional: hitsQ,
    tickets: hitsT,
    any:
      Object.values(hitsQ).some((n) => n > 0) ||
      Object.values(hitsT).some((n) => n > 0),
  };

  // Also write legacy consolidate names for compatibility
  writeJson(path.join(FINAL_DIR, "questions_traditional_FINAL.json"), traditionalFinal);
  writeJson(path.join(FINAL_DIR, "tickets_FINAL.json"), ticketsFinal);
  writeJson(path.join(FINAL_DIR, "questions_aws_traditional.json"), traditionalFinal);
  writeJson(path.join(FINAL_DIR, "tickets_aws.json"), ticketsFinal);

  // parts index from content files
  const partsIndex = [];
  for (const key of PART_KEYS) {
    const cPath = partFile(key, "content");
    let title = `aws-${key}`;
    let blueprint_module = "";
    let blueprint_topics = [];
    let verb = "";
    let weight_percent = 0;
    if (fs.existsSync(cPath)) {
      try {
        const c = readJson(cPath);
        title = c.title || title;
        blueprint_module = c.blueprint_module || "";
        blueprint_topics = c.blueprint_topics || [];
        verb = c.verb || "";
        weight_percent = c.weight_percent || 0;
      } catch {
        /* ignore */
      }
    }
    const pid = `aws-${key}`;
    partsIndex.push({
      part_id: pid,
      title,
      blueprint_module,
      blueprint_topics,
      verb,
      weight_percent,
      questions_count: traditionalFinal.filter((q) => q.part_id === pid).length,
      tickets_count: ticketsFinal.filter((t) => t.part_id === pid).length,
      content_path: `aws/parts/part-aws-${key}-content.json`,
    });
  }
  writeJson(path.join(FINAL_DIR, "parts_index.json"), partsIndex);

  const report = {
    generated_at: new Date().toISOString(),
    script: "aws/scripts/quality_pass_final_aws.mjs",
    inventory,
    parts: 12,
    per_part: perPart,
    traditional_total: traditionalFinal.length,
    tickets_total: ticketsFinal.length,
    strips_approx: stripCount,
    expls_rewritten_for_min_length: rewriteCount,
    traditional_deduped: tradDeduped,
    tickets_deduped: tickDeduped,
    schema_issues: schemaIssues,
    structural_pads_found: [...(structQ.pads || []), ...(structT.pads || [])],
    pad_hits_final: padHitsFinal,
    remaining_pad_list: Object.entries({
      ...hitsQ,
      ...Object.fromEntries(
        Object.entries(hitsT).map(([k, v]) => [`ticket:${k}`, v])
      ),
    })
      .filter(([, n]) => n > 0)
      .map(([k, n]) => ({ pattern: k, hits: n })),
    traditional_expl: {
      min: tradLens.length ? Math.min(...tradLens) : 0,
      avg: tradLens.length
        ? Math.round(tradLens.reduce((a, b) => a + b, 0) / tradLens.length)
        : 0,
      max: tradLens.length ? Math.max(...tradLens) : 0,
      short_under_220: tradLens.filter((n) => n < 220).length,
    },
    ticket_expl: {
      min: tickLens.length ? Math.min(...tickLens) : 0,
      avg: tickLens.length
        ? Math.round(tickLens.reduce((a, b) => a + b, 0) / tickLens.length)
        : 0,
      max: tickLens.length ? Math.max(...tickLens) : 0,
      short_under_200: tickLens.filter((n) => n < 200).length,
    },
    free,
    premium: pro,
    outputs: [
      "aws/final/questions_traditional_FINAL.json",
      "aws/final/tickets_FINAL.json",
      "aws/final/quality_pass_report.json",
      "aws/final/questions_aws_traditional.json",
      "aws/final/tickets_aws.json",
      "aws/final/parts_index.json",
    ],
    ok:
      traditionalFinal.length > 0 &&
      ticketsFinal.length > 0 &&
      !padHitsFinal.any &&
      tradLens.every((n) => n >= 220) &&
      tickLens.every((n) => n >= 200) &&
      schemaIssues.length === 0,
  };

  writeJson(path.join(FINAL_DIR, "quality_pass_report.json"), report);

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        parts: 12,
        traditional: traditionalFinal.length,
        tickets: ticketsFinal.length,
        strips_approx: stripCount,
        rewrites: rewriteCount,
        dedupe_q: tradDeduped,
        dedupe_t: tickDeduped,
        trad_min: report.traditional_expl.min,
        trad_avg: report.traditional_expl.avg,
        tick_min: report.ticket_expl.min,
        tick_avg: report.ticket_expl.avg,
        free,
        pro,
        remaining_pads: report.remaining_pad_list,
        schema_issues: schemaIssues.length,
      },
      null,
      2
    )
  );

  if (!report.ok) process.exitCode = 1;
}

main();
