import fs from "node:fs";
const d = JSON.parse(
  fs.readFileSync(new URL("./lote_166_265_enriched.json", import.meta.url), "utf8")
);
let issues = 0;
const missingExpl = [];
const ocrHits = [];
const reBad =
  /\b(congure|conguration|congured|prex|trac|rewall|ooding|sucient|rmware|dened|specic|fulll|toot)\b/i;
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
  if (!t.explicacao_profunda || t.explicacao_profunda.length < 60) missingExpl.push(r.source_id);
  const blob = JSON.stringify(t);
  if (reBad.test(blob)) ocrHits.push(r.source_id);
  if (t.question_type !== "traditional" || t.isPremium !== true) issues++;
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
  missingExpl,
  ocrHits: ocrHits.slice(0, 20),
  tickets: d.filter((x) => x.ticket).length,
  nulls: d.filter((x) => x.ticket === null).length,
});
const exT = d.find((x) => x.source_id === 174).traditional;
const exK = d.find((x) => x.source_id === 172).ticket;
console.log("TRAD174", exT.enunciado.slice(0, 100));
console.log("TICK172", exK.sintoma.slice(0, 100));
