import fs from "fs";
import path from "path";

function strip(t) {
  return t.normalize("NFD").replace(/\p{M}/gu, "");
}

const dir = "v2/parts";
const files = fs.readdirSync(dir).filter((f) => f.endsWith("-content.json")).sort();
console.log("file|part_id|title|notes|bullets|chars|oque|quando|ex|arm|lig|stub");
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const notes = s.study_notes || [];
  const bullets = notes.reduce((n, x) => n + (x.bullets || []).length, 0);
  const chars = notes.reduce(
    (n, x) => n + (x.bullets || []).reduce((m, b) => m + b.length, 0),
    0
  );
  const heads = notes.map((h) => strip((h.heading || "").toLowerCase()));
  const hasOque = heads.some((h) => h.includes("o que"));
  const hasQuando = heads.some((h) => h.includes("quando"));
  const hasEx = heads.some(
    (h) => h.includes("exemplo") || h.includes("cenario") || h.includes("lab")
  );
  const hasArm = heads.some((h) => h.includes("armadilha"));
  const hasLig = heads.some((h) => h.includes("simulado") || h.includes("trilha"));
  const blob = JSON.stringify(notes);
  const stub =
    chars < 400 ||
    blob.includes("TODO") ||
    blob.toLowerCase().includes("em breve") ||
    blob.toLowerCase().includes("lorem");
  console.log(
    [
      f,
      s.part_id,
      String(s.title || "").slice(0, 42),
      notes.length,
      bullets,
      chars,
      hasOque,
      hasQuando,
      hasEx,
      hasArm,
      hasLig,
      stub,
    ].join("|")
  );
}
