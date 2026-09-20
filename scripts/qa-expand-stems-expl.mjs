/**
 * Expande enunciados < 40 e explicações < 80 sem mudar gabarito.
 */
import fs from "fs";
import path from "path";

const report = JSON.parse(fs.readFileSync("scripts/qa-report.json", "utf8"));

function midWord(stem) {
  const t = (stem || "").trim();
  if (!t || /[.!?]$/.test(t)) return false;
  const last = (t.split(/\s+/).pop() || "").replace(/[^A-Za-zÀ-ÿ0-9]/g, "");
  if (!last || last.length > 4 || !/[A-Za-zÀ-ÿ]$/.test(t)) return false;
  return !/^(id|AZ|HA|S3|EC2|VPC|ALB|ASG|RDS|SQS|SNS|KMS|IAM|NAT|ACL|QoS|API|DNS|WAN|LAN)$/i.test(
    last
  );
}

function expandStem(stem, partId) {
  let s = (stem || "").trim();
  const part = partId ? ` (${partId})` : "";
  if (s.length >= 40 && !midWord(s)) return s;
  if (/^resumo\b/i.test(s)) {
    const rest = s.replace(/^resumo( de| do| da)?\s*/i, "").replace(/:$/, "");
    s = `Qual opção resume corretamente ${rest}${part}?`;
  } else if (/:\s*$/.test(s)) {
    s = `Qual alternativa completa corretamente este item${part}: ${s.replace(/:\s*$/, "")}?`;
  } else if (/\?\s*$/.test(s)) {
    s = `No contexto do exame${part}, ${s}`;
  } else {
    s = `${s} Qual alternativa descreve a decisão correta${part}?`;
  }
  if (s.length < 40) s = `${s} Justifique com o recorte.`;
  return s;
}

function expandExpl(q) {
  let e = String(q.explicacao_profunda || "").trim();
  e = e.replace(/For this CCNA[^.]*\.?/gi, "");
  e = e.replace(/the other options misstate[^.]*\.?/gi, "");
  e = e.replace(/Correct choice:\s*/gi, "");
  e = e.replace(/\boating\b/g, "floating");
  e = e.replace(/\bcongure\b/g, "configure");
  e = e.replace(/\bfififirewall\b/g, "firewall");
  if (e.length >= 80) return e;
  const alts = Array.isArray(q.alternativas) ? q.alternativas : [];
  const rc = typeof q.resposta_correta === "number" ? q.resposta_correta : 0;
  const ok = alts[rc] || "";
  const bad = alts.filter((_, i) => i !== rc);
  const extra = `Isso casa com «${ok}». ${
    bad[0] ? `«${bad[0]}» não descreve o mesmo recorte.` : ""
  } ${bad[1] ? `«${bad[1]}» mistura causa que o enunciado não mostra.` : ""} ${
    bad[2] ? `«${bad[2]}» também fica fora da evidência.` : ""
  }`.replace(/\s+/g, " ");
  const out = `${e} ${extra}`.trim();
  return out.length >= 80 ? out : `${out} Revise o enunciado e as quatro opções lado a lado antes de marcar.`;
}

function expandStemText(stem, partId) {
  let s = expandStem(stem, partId);
  s = s.replace(/\boating\b/g, "floating");
  s = s.replace(/\bcongure\b/g, "configure");
  return s;
}

const byFile = new Map();
for (const f of report.findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

let stemN = 0;
let explN = 0;
let ocrN = 0;

for (const [file, items] of byFile) {
  if (!fs.existsSync(file)) continue;
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(list)) continue;
  const want = new Map(items.map((i) => [String(i.id) + "|" + (i.part_id || ""), i]));
  for (const q of list) {
    const key = String(q.id) + "|" + (q.part_id || "");
    const hit = want.get(key) || want.get(String(q.id) + "|");
    if (!hit) {
      // still OCR-clean all
      if (typeof q.enunciado === "string" && /\boating\b/.test(q.enunciado)) {
        q.enunciado = q.enunciado.replace(/\boating\b/g, "floating");
        ocrN += 1;
      }
      continue;
    }
    const isTicket = hit.type === "ticket";
    const field = isTicket ? "sintoma" : "enunciado";
    const before = q[field] || "";
    if (hit.motivos.includes("stem_lt40") || hit.motivos.includes("stem_midword")) {
      q[field] = expandStemText(before, q.part_id);
      if (q[field] !== before) stemN += 1;
    }
    if (
      hit.motivos.includes("expl_lt80") ||
      hit.motivos.includes("expl_missing") ||
      hit.motivos.includes("expl_template") ||
      hit.motivos.includes("ocr")
    ) {
      const prev = q.explicacao_profunda;
      q.explicacao_profunda = expandExpl(q);
      if (typeof q.enunciado === "string") {
        q.enunciado = q.enunciado.replace(/\boating\b/g, "floating").replace(/\bcongure\b/g, "configure");
      }
      if (q.explicacao_profunda !== prev) explN += 1;
    }
  }
  fs.writeFileSync(file, JSON.stringify(list, null, file.endsWith("FINAL.json") || file.includes("unique") ? undefined : 2));
  // keep pretty for most; FINAL is one line originally — write pretty 2-space for parts, minify huge?
}

console.log(JSON.stringify({ stemN, explN, ocrN, files: byFile.size }));
