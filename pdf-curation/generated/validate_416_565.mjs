import fs from "node:fs";
const d = JSON.parse(
  fs.readFileSync(new URL("./lote_416_565_enriched.json", import.meta.url), "utf8")
);
let issues = 0;
const reBad =
  /\b(congure|conguration|congured|prex|trac|rewall|ooding|dened|specic|identies|ooads|authenticaton|input erros)\b/i;
const ocr = [];
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
  if (!t.explicacao_profunda || t.explicacao_profunda.length < 40) {
    console.log("short", r.source_id);
    issues++;
  }
  if (reBad.test(JSON.stringify(t))) ocr.push(r.source_id);
  if (/^QUESTION\s+\d+/i.test(t.enunciado)) ocr.push("QHEAD-" + r.source_id);
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
  ocr: ocr.slice(0, 30),
  tickets: d.filter((x) => x.ticket).length,
  nulls: d.filter((x) => x.ticket === null).length,
});
console.log("TRAD", d.find((x) => x.source_id === 493).traditional.enunciado.slice(0, 90));
console.log("TICK", d.find((x) => x.source_id === 547).ticket.sintoma.slice(0, 90));
