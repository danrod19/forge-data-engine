import fs from "node:fs";
const p = new URL("./lote_91_165_enriched.json", import.meta.url);
const d = JSON.parse(fs.readFileSync(p, "utf8"));
const s = JSON.stringify(d);
const bad = [
  "congure",
  "conguration",
  " trac",
  "rewall",
  "ooding",
  "prex",
  "benet",
  "identies",
  "specic",
  "toot",
  "payloa",
  "Choosetwo",
  "Whatis",
  "ow-sampler",
  "Unied",
  "(cong)",
  "cong#",
];
for (const b of bad) {
  if (s.includes(b)) console.log("leftover", b);
}
let issues = 0;
for (const r of d) {
  const t = r.traditional;
  if (!t || t.alternativas?.length !== 4) {
    console.log("bad alts", r.source_id);
    issues++;
  }
  if (t.resposta_correta < 0 || t.resposta_correta > 3) {
    console.log("bad idx", r.source_id);
    issues++;
  }
}
console.log({
  items: d.length,
  issues,
  tickets: d.filter((x) => x.ticket).length,
  nulls: d.filter((x) => x.ticket === null).length,
});
console.log("sample trad 96", d.find((x) => x.source_id === 96).traditional.enunciado);
console.log("sample ticket 91 sintoma", d.find((x) => x.source_id === 91).ticket.sintoma.slice(0, 120));
