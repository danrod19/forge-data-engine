/**
 * Rebalance ticket answer positions.
 *
 * Problem: many tickets have resposta_correta === 0 (always option A).
 * Fix: shuffle alternativas, keep the same correct *text*, update index.
 *
 * Usage:
 *   node scripts/rebalance-ticket-answers.mjs
 *   node scripts/rebalance-ticket-answers.mjs --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry-run");

/** Ticket banks used by Trilha (src/data/tickets.ts merge). */
const TARGET_FILES = [
  "src/data/tickets_unique.json",
  "src/data/tickets_from_bulk.json",
];

/** Patterns that break after shuffle if they hard-code letter positions. */
const LETTER_MENTION_RE =
  /\b(?:alternativa|opção|opcao|letra)\s*[ABCD]\b|\b(?:opção|opcao|alternativa)\s*[1-4]\b/gi;

/**
 * Mulberry32 PRNG — deterministic per seed.
 * @param {number} seed
 */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stable seed from ticket id (+ file salt so same id in two banks can differ).
 * @param {unknown} id
 * @param {string} fileSalt
 */
function seedFromId(id, fileSalt) {
  const s = `${fileSalt}:${String(id ?? "")}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Fisher–Yates with seeded RNG.
 * @template T
 * @param {T[]} items
 * @param {() => number} rand
 */
function shuffleSeeded(items, rand) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * @param {unknown} ticket
 * @param {string} fileSalt
 */
function rebalanceTicket(ticket, fileSalt) {
  if (!ticket || typeof ticket !== "object") {
    return { ticket, skipped: true, reason: "not-object" };
  }
  const t = /** @type {Record<string, unknown>} */ (ticket);
  const alts = t.alternativas;
  if (!Array.isArray(alts) || alts.length < 2) {
    return { ticket: t, skipped: true, reason: "bad-alternativas" };
  }

  const oldIdx =
    typeof t.resposta_correta === "number" &&
    t.resposta_correta >= 0 &&
    t.resposta_correta < alts.length
      ? t.resposta_correta
      : 0;

  const correctText = alts[oldIdx];
  if (typeof correctText !== "string") {
    return { ticket: t, skipped: true, reason: "correct-not-string" };
  }

  const rand = mulberry32(seedFromId(t.id, fileSalt));
  const shuffled = shuffleSeeded(
    alts.map((a) => String(a)),
    rand
  );
  const newIdx = shuffled.findIndex((a) => a === correctText);
  if (newIdx < 0) {
    return { ticket: t, skipped: true, reason: "correct-lost" };
  }

  // Avoid no-op when already non-zero and shuffle kept position — still ok to write
  const next = {
    ...t,
    alternativas: shuffled,
    resposta_correta: newIdx,
  };

  return {
    ticket: next,
    skipped: false,
    oldIdx,
    newIdx,
    moved: oldIdx !== newIdx,
  };
}

/**
 * @param {unknown[]} tickets
 */
function distribution(tickets) {
  /** @type {Record<number, number>} */
  const c = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const raw of tickets) {
    if (!raw || typeof raw !== "object") continue;
    const t = /** @type {Record<string, unknown>} */ (raw);
    const idx =
      typeof t.resposta_correta === "number" ? t.resposta_correta : -1;
    if (idx >= 0 && idx <= 3) c[idx] += 1;
    else c[idx] = (c[idx] || 0) + 1;
  }
  return c;
}

/**
 * @param {unknown[]} tickets
 * @param {string} sourceLabel
 */
function findLetterMentions(tickets, sourceLabel) {
  /** @type {{ source: string, id: unknown, matches: string[] }[]} */
  const hits = [];
  for (const raw of tickets) {
    if (!raw || typeof raw !== "object") continue;
    const t = /** @type {Record<string, unknown>} */ (raw);
    const exp =
      typeof t.explicacao_profunda === "string" ? t.explicacao_profunda : "";
    if (!exp) continue;
    const matches = exp.match(LETTER_MENTION_RE);
    if (matches && matches.length > 0) {
      hits.push({
        source: sourceLabel,
        id: t.id,
        matches: [...new Set(matches.map((m) => m.toLowerCase()))],
      });
    }
  }
  return hits;
}

function pct(n, total) {
  if (!total) return "0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

function main() {
  console.log(
    DRY_RUN
      ? "=== rebalance-ticket-answers (DRY RUN) ==="
      : "=== rebalance-ticket-answers ==="
  );

  /** @type {Record<string, unknown>} */
  const report = {
    dryRun: DRY_RUN,
    files: {},
    letterMentions: [],
  };

  /** @type {{ source: string, id: unknown, matches: string[] }[]} */
  const allLetterHits = [];

  for (const rel of TARGET_FILES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      console.warn(`SKIP missing: ${rel}`);
      continue;
    }

    const raw = fs.readFileSync(abs, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      console.warn(`SKIP not array: ${rel}`);
      continue;
    }

    const before = distribution(data);
    let processed = 0;
    let skipped = 0;
    let moved = 0;
    /** @type {unknown[]} */
    const out = [];

    for (const item of data) {
      const result = rebalanceTicket(item, rel);
      if (result.skipped) {
        skipped += 1;
        out.push(item);
        continue;
      }
      processed += 1;
      if (result.moved) moved += 1;
      out.push(result.ticket);
    }

    const after = distribution(out);
    const letterHits = findLetterMentions(out, rel);
    allLetterHits.push(...letterHits);

    report.files[rel] = {
      total: data.length,
      processed,
      skipped,
      moved,
      before,
      after,
      letterMentionCount: letterHits.length,
      letterMentionIds: letterHits.map((h) => h.id),
    };

    console.log(`\n${rel}`);
    console.log(`  total=${data.length} processed=${processed} moved=${moved} skipped=${skipped}`);
    console.log(`  before: ${JSON.stringify(before)}`);
    console.log(`  after:  ${JSON.stringify(after)}`);
    for (const k of [0, 1, 2, 3]) {
      console.log(
        `    [${k}] ${after[k] ?? 0} (${pct(after[k] ?? 0, data.length)})`
      );
    }
    console.log(`  explicações com letra fixa: ${letterHits.length}`);

    if (!DRY_RUN) {
      fs.writeFileSync(abs, `${JSON.stringify(out, null, 2)}\n`, "utf8");
      console.log(`  wrote ${rel}`);
    }
  }

  report.letterMentions = allLetterHits;

  const reportPath = path.join(
    root,
    "scripts",
    "rebalance-ticket-answers.report.json"
  );
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`\nReport: ${path.relative(root, reportPath)}`);

  if (allLetterHits.length > 0) {
    console.log("\n--- IDs com menção a alternativa/opção/letra A–D ---");
    for (const h of allLetterHits) {
      console.log(
        `  ${h.source} id=${h.id} → ${h.matches.join(", ")}`
      );
    }
  } else {
    console.log("\nNenhuma explicação com menção explícita a letra A–D.");
  }

  console.log("\nDone.");
}

main();
