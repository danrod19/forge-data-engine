/**
 * Extract traditional items rejected for template explanations.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MARKERS = [
  "For this CCNA 200-301 item, the correct statement is",
  "The other options misstate the mechanism",
];
const EXHIBIT_RE = /refer to the\s*(exhibit|\.)/i;

const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.startsWith("lote_") && f.endsWith("_enriched.json"))
  .sort();

const rejected = [];
let exhibitSkip = 0;
let altsSkip = 0;

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8"));
  for (const row of data) {
    const t = row.traditional;
    if (!t) continue;
    const expl = t.explicacao_profunda || "";
    const hasTemplate = MARKERS.some((m) => expl.includes(m));
    if (!hasTemplate) continue;
    if (EXHIBIT_RE.test(t.enunciado || "")) {
      exhibitSkip++;
      continue;
    }
    if (!Array.isArray(t.alternativas) || t.alternativas.length < 4) {
      altsSkip++;
      continue;
    }
    rejected.push({
      source_id: row.source_id ?? t.id,
      source_file: f,
      traditional: t,
    });
  }
}

const out = path.join(__dirname, "traditional_template_rejected.json");
fs.writeFileSync(out, JSON.stringify(rejected, null, 2));
console.log(
  JSON.stringify(
    {
      files,
      rejected: rejected.length,
      exhibit_skipped: exhibitSkip,
      alts_skipped: altsSkip,
      out,
      id_sample: rejected.slice(0, 5).map((r) => r.source_id),
      id_range: [rejected[0]?.source_id, rejected[rejected.length - 1]?.source_id],
    },
    null,
    2
  )
);
