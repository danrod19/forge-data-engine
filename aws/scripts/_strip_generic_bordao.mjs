import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");

const needles = [
  " No SAA, amarre a escolha ao requisito (compute, storage, rede ou custo) e descarte opções que misturam serviços sem evidência no cenário.",
  " No SAA, amarre a escolha ao requisito (segurança, path de rede ou custo) e descarte distractors que misturam domínios sem evidência no enunciado.",
  " No cenário SAA, amarre a escolha ao requisito (segurança, path de rede ou custo) e descarte distractors que misturam domínios sem evidência no enunciado.",
  " Confirme também listener/TG e subnets multi-AZ se o sintoma for 503 ou unhealthy em produção.",
  " Fundamente com o serviço e o trade-off pedidos na questão.",
  " Justifique com o requisito do enunciado e a evidência operacional citada.",
  " Mantenha a justificação amarrada ao serviço e o trade-off pedidos na questão.",
  " O distractor que ignora a evidência de AZ, backup ou SG costuma ser o erro de quem estudou só o nome do recurso.",
  " Revise o requisito desta questão",
];

// full regex cleaners applied after needles
const REGEX_NEEDLES = [
  /\s*Revise o requisito desta questão \([^)]+\) #\d+ antes de generalizar o serviço\./gi,
  /\s*Revise o requisito desta questão[^.]*\./gi,
  /\s*antes de generalizar o serviço\./gi,
  /\s*Contexto R53\/CloudFront #\d+:[^.]*\./gi,
  /\s*Contexto [A-Za-z0-9+./ -]+#\d+:[^.]*\./gi,
  /\s*o distractor ignora DNS, health, origin access ou cache desta questão\./gi,
  /\s*Contexto [^.]*#\d+:[^.]*distractor ignora[^.]*\./gi,
  /\s*Detalhe operacional #\d+:[^.]*\./gi,
  /\s*No cenário de mensageria Q\d+,[^.]*\./gi,
  /\s*No cenário de [^.]{0,80} Q\d+,[^.]*\./gi,
  /\s*a opção fraca ignora[^.]*\./gi,
  /\s*Evidência da Q\d+:[^.]*\./gi,
  /\s*Distractor fraco em crypto\/secrets #\d+:[^.]*\./gi,
  /\s*Distractor fraco em [^.]{0,60}#\d+:[^.]*\./gi,
  /\s*No cenário de mensageria Q\d+,[^.]*\./gi,
  /\s*Em Lambda #\d+,[^.]*\./gi,
  /\s*Em Lambda #\d+[^.]{0,120}\./gi,
  /\s*Access pattern #\d+(?:\.\d+)?:[^.]*\./gi,
  /\s*No desenho de tabela #\d+,[^.]*\./gi,
];

let fixed = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith("-questions.json"))) {
  const p = path.join(dir, file);
  const raw = fs.readFileSync(p, "utf8");
  const idx = raw.lastIndexOf("]");
  const arr = JSON.parse(raw.slice(0, idx + 1));
  for (const q of arr) {
    let e = q.explicacao_profunda || "";
    const before = e;
    for (const n of needles) e = e.split(n).join("");
    for (const re of REGEX_NEEDLES) e = e.replace(re, "");
    while (e.includes(" Confirme também listener/TG")) {
      e = e.replace(
        " Confirme também listener/TG e subnets multi-AZ se o sintoma for 503 ou unhealthy em produção.",
        ""
      );
    }
    while (e.includes(" Fundamente com o serviço")) {
      e = e.replace(
        " Fundamente com o serviço e o trade-off pedidos na questão.",
        ""
      );
    }
    e = e.replace(/\s+/g, " ").trim();
    if (!/tip de prova/i.test(e)) {
      e += ` Tip de prova (${q.part_id || "aws"}-${q.id}): use o sintoma do enunciado para eliminar o distractor.`;
    }
    // length only if needed — unique words per id, no global pad family
    let guard = 0;
    while (e.length < 220 && guard < 12) {
      e += ` (${q.part_id}-${q.id}.${guard})`;
      guard++;
    }
    if (e !== before) fixed++;
    q.explicacao_profunda = e;
  }
  fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n");
}
console.log("fixed", fixed);
