/**
 * Sync Estudo bank UI for V1 parts 5.1–6.5 from src/data/parts.
 * Usage: node scripts/_sync_v1_estudo_bank_5_6.mjs
 * (Full regen: node scripts/gen-estudo-content.mjs)
 */
import fs from "fs";
import path from "path";

const ids = [
  "5.1",
  "5.2",
  "5.3",
  "5.4",
  "5.5",
  "6.1",
  "6.2",
  "6.3",
  "6.4",
  "6.5",
];

const outDir = "src/data/estudo-content-bank";
fs.mkdirSync(outDir, { recursive: true });

for (const id of ids) {
  const src = path.join("src/data/parts", `part-${id}-content.json`);
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  const norm = {
    part_id: String(raw.part_id ?? id),
    title: String(raw.title ?? id),
    topic_list: Array.isArray(raw.topic_list) ? raw.topic_list.map(String) : [],
    study_notes: Array.isArray(raw.study_notes)
      ? raw.study_notes.map((n) => ({
          heading: String(n.heading ?? ""),
          bullets: Array.isArray(n.bullets) ? n.bullets.map(String) : [],
          exam_tips: Array.isArray(n.exam_tips) ? n.exam_tips.map(String) : [],
        }))
      : [],
    key_commands: Array.isArray(raw.key_commands)
      ? raw.key_commands.map(String)
      : [],
    must_know: Array.isArray(raw.must_know) ? raw.must_know.map(String) : [],
  };
  const out = path.join(outDir, `${norm.part_id}.json`);
  fs.writeFileSync(out, JSON.stringify(norm));
  console.log("synced", out, "notes=", norm.study_notes.length);
}
