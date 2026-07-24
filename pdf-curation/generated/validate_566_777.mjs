import fs from "node:fs";
const d = JSON.parse(
  fs.readFileSync(new URL("./lote_566_777_enriched.json", import.meta.url), "utf8")
);
let issues = 0;
const short = [];
const ocr = [];
const reBad =
  /\b(congure|conguration|congured|prex|trac|rewall|ooding|dened|specic|identies|aadministrator)\b/i;
for (const r of d) {
  const t = r.traditional;
  if (!t || t.alternativas?.length !== 4) {
    console.log("alts", r.source_id);
    issues++;
  }
  if (t.resposta_correta < 0 || t.resposta_correta > 3) {
    console.log("idx", r.source_id);
    issues++;
  }
  if (!t.explicacao_profunda || t.explicacao_profunda.length < 60) short.push(r.source_id);
  if (reBad.test(JSON.stringify(t))) ocr.push(r.source_id);
  if (/^QUESTION\s+\d+/i.test(t.enunciado)) ocr.push("HEAD-" + r.source_id);
  if (r.ticket) {
    const k = r.ticket;
    if (!k.sintoma || !k.cli_output || k.alternativas?.length !== 4) {
      console.log("ticket", r.source_id);
      issues++;
    }
  }
}
console.log({
  items: d.length,
  first: d[0].source_id,
  last: d[d.length - 1].source_id,
  issues,
  short: short.slice(0, 15),
  shortCount: short.length,
  ocr: ocr.slice(0, 20),
  tickets: d.filter((x) => x.ticket).length,
  nulls: d.filter((x) => x.ticket === null).length,
});
console.log("TRAD", d.find((x) => x.source_id === 566).traditional.enunciado);
console.log("TICK", d.find((x) => x.source_id === 777).ticket.sintoma.slice(0, 100));
