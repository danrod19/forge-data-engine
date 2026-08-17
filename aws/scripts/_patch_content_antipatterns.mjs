import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");

const notes = {
  "1.1": {
    heading: "Anti-patterns de prova (IAM)",
    bullets: [
      "Access key de IAM user em EC2/Lambda/user-data ou repositório de código.",
      "AdministratorAccess ou s3:* em Resource * para humanos júnior 'só por enquanto'.",
      "Confiar só em Allow extra quando a mensagem mostra explicit deny.",
      "Corrigir permissions S3 da role e ignorar trust policy / instance profile na EC2.",
      "Usar root da conta no dia a dia de operações e pipelines.",
    ],
    exam_tips: [
      "Workload AWS → role + STS; humano console → user/group; AccessDenied → principal, Allow, Deny, trust.",
    ],
  },
  "1.2": {
    heading: "Anti-patterns de prova (VPC)",
    bullets: [
      "Subnet 'privada' com 0.0.0.0/0 → IGW (vira pública de fato).",
      "Banco ou app de dados com EIP e SG 0.0.0.0/0 na porta do engine.",
      "Produção inteira em uma única AZ quando o requisito pede multi-AZ.",
      "Culpar só o Security Group quando a NACL tem Deny ou a rota 0.0.0.0/0 falta.",
      "Abrir SSH 0.0.0.0/0 no bastion em vez de CIDR corporativo ou SSM.",
    ],
    exam_tips: [
      "Timeout de rede: rota → SG → NACL → IGW/NAT; multi-AZ: conte subnets por AZ.",
    ],
  },
  "1.3": {
    heading: "Anti-patterns de prova (S3)",
    bullets: [
      "Principal * + s3:GetObject com Block Public Access desligado ou ausente.",
      "Access key de user no app mobile/CI em vez de role least privilege.",
      "Dados frios meses em Standard sem lifecycle (custo evitável).",
      "Empilhar Allow quando o erro cita explicit deny na identity ou bucket policy.",
      "Assumir que delete com versioning apaga o histórico (delete marker / versões).",
    ],
    exam_tips: [
      "AccessDenied S3: principal → IAM → bucket policy → Deny → BPA → key/ARN → KMS se SSE-KMS.",
    ],
  },
};

for (const p of ["1.1", "1.2", "1.3"]) {
  const f = path.join(PARTS, `part-aws-${p}-content.json`);
  const c = JSON.parse(fs.readFileSync(f, "utf8"));
  const has = (c.study_notes || []).some((n) => /anti-pattern/i.test(n.heading || ""));
  if (!has) c.study_notes.push(notes[p]);
  if (!Array.isArray(c.must_know)) c.must_know = [];
  while (c.must_know.length < 6) {
    c.must_know.push("Revisar least privilege e evidência CLI no TShoot desta part.");
  }
  if (c.must_know.length > 8) c.must_know = c.must_know.slice(0, 8);
  fs.writeFileSync(f, JSON.stringify(c, null, 2) + "\n", "utf8");
  console.log(
    "content",
    p,
    "notes",
    c.study_notes.length,
    "must_know",
    c.must_know.length,
    "anti",
    (c.study_notes || []).some((n) => /anti-pattern/i.test(n.heading || ""))
  );
}
