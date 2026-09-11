/**
 * Sync pontual: v2/parts part-v2-3.3|3.4|4.2|4.3-content.json
 * → src/data/estudo-content-bank/v2-*.json (mesmo normalize de gen-estudo-content.mjs)
 * Uso: node scripts/_sync_v2_estudo_bank_slice.mjs
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

const ids = ["3.3", "3.4", "4.2", "4.3"];
const outDir = "src/data/estudo-content-bank";
const requiredHead = [
  [/o que/i, "O que é"],
  [/quando/i, "Quando usar/NÃO"],
  [/exemplo/i, "Exemplo"],
  [/armadilha/i, "Armadilhas"],
  [/simulado|trilha/i, "Ligação Simulado+Trilha"],
];

for (const id of ids) {
  const src = path.join("v2/parts", `part-v2-${id}-content.json`);
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  if (raw.part_id !== `v2-${id}`) {
    throw new Error(`part_id drift in ${src}: ${raw.part_id}`);
  }
  const norm = normalize(raw, `v2-${id}`);
  const heads = norm.study_notes.map((n) => n.heading);
  for (const [re, label] of requiredHead) {
    if (!heads.some((h) => re.test(h))) {
      throw new Error(`v2-${id} missing heading ~ ${label}; got: ${heads.join(" | ")}`);
    }
  }
  if (norm.study_notes.length < 6 || norm.study_notes.length > 8) {
    throw new Error(`v2-${id} study_notes count ${norm.study_notes.length} (want 6–8)`);
  }
  const outName = `v2-${id}.json`;
  fs.writeFileSync(path.join(outDir, outName), JSON.stringify(norm));
  console.log("OK", outName, "notes=", norm.study_notes.length, "heads=", heads.join(" · "));
}

console.log("slice sync done — optional full regen: node scripts/gen-estudo-content.mjs");
