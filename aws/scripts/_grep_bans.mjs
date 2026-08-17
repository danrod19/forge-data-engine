import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const q = JSON.parse(
  fs.readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "final", "questions_aws_traditional.json"),
    "utf8"
  )
);
const phrases = [
  "No SAA, amarre",
  "Confirme também listener",
  "Revise o requisito desta questão",
  "Contexto R53",
  "distractor ignora",
  "Detalhe operacional #",
  "Fundamente com o serviço",
  "antes de generalizar o serviço",
  "Contexto ",
  "No cenário de",
  "opção fraca ignora",
  "Evidência da Q",
  "Distractor fraco",
  "Em Lambda #",
  "Access pattern #",
  "Distractor fraco",
  "No desenho de tabela #",
];
for (const p of phrases) {
  const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const n = q.filter((x) => re.test(x.explicacao_profunda || "")).length;
  console.log(`${JSON.stringify(p)}: ${n}`);
}
