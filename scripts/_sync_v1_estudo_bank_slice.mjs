/**
 * Sync pontual V1: src/data/parts/part-<id>-content.json
 * → src/data/estudo-content-bank/<id>.json (mesmo normalize de gen-estudo-content.mjs)
 * Uso: node scripts/_sync_v1_estudo_bank_slice.mjs
 *      node scripts/_sync_v1_estudo_bank_slice.mjs 3.1 3.2 3.3 3.4 3.5
 * Default (sem args): 3.1–3.5
 * Full regen: node scripts/gen-estudo-content.mjs
 */
import fs from "fs";
import path from "path";

function normalize(raw, fallbackId) {
  const notes = Array.isArray(raw.study_notes)
    ? raw.study_notes.map((n) => ({
        heading: String(n.heading ?? ""),
        bullets: Array.isArray(n.bullets) ? n.bullets.map(String) : [],
        exam_tips: Array.isArray(n.exam_tips) ? n.exam_tips.map(String) : [],
      }))
    : [];
  return {
    part_id: String(raw.part_id ?? fallbackId),
    title: String(raw.title ?? fallbackId),
    topic_list: Array.isArray(raw.topic_list) ? raw.topic_list.map(String) : [],
    study_notes: notes,
    key_commands: Array.isArray(raw.key_commands)
      ? raw.key_commands.map(String)
      : [],
    must_know: Array.isArray(raw.must_know) ? raw.must_know.map(String) : [],
  };
}

const ids = process.argv.slice(2);
const targetIds = ids.length ? ids : ["3.1", "3.2", "3.3", "3.4", "3.5"];
const outDir = "src/data/estudo-content-bank";
const requiredHead = [
  [/o que/i, "O que é"],
  [/quando/i, "Quando usar/NÃO"],
  [/exemplo/i, "Exemplo"],
  [/armadilha/i, "Armadilhas"],
  [/simulado|trilha/i, "Ligação Simulado+Trilha"],
];

for (const id of targetIds) {
  const src = path.join("src/data/parts", `part-${id}-content.json`);
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  if (String(raw.part_id) !== id) {
    throw new Error(`part_id drift in ${src}: ${raw.part_id}`);
  }
  const norm = normalize(raw, id);
  const heads = norm.study_notes.map((n) => n.heading);
  for (const [re, label] of requiredHead) {
    if (!heads.some((h) => re.test(h))) {
      throw new Error(`${id} missing heading ~ ${label}; got: ${heads.join(" | ")}`);
    }
  }
  if (norm.study_notes.length < 6 || norm.study_notes.length > 8) {
    throw new Error(`${id} study_notes count ${norm.study_notes.length} (want 6–8)`);
  }
  const outName = `${id}.json`;
  fs.writeFileSync(path.join(outDir, outName), JSON.stringify(norm));
  console.log("OK", outName, "notes=", norm.study_notes.length, "heads=", heads.join(" · "));
}

console.log("slice sync done — optional full regen: node scripts/gen-estudo-content.mjs");
