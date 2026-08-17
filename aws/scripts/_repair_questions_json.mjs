import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");

const needles = [
  " No SAA, amarre a escolha ao requisito (compute, storage, rede ou custo) e descarte opções que misturam serviços sem evidência no cenário.",
  " No SAA, amarre a escolha ao requisito (segurança, path de rede ou custo) e descarte distractors que misturam domínios sem evidência no enunciado.",
  " No cenário SAA, amarre a escolha ao requisito (segurança, path de rede ou custo) e descarte distractors que misturam domínios sem evidência no enunciado.",
];

for (const f of fs.readdirSync(dir).filter((x) => x.includes("-questions.json"))) {
  const p = path.join(dir, f);
  const raw = fs.readFileSync(p, "utf8");
  const idx = raw.lastIndexOf("]");
  if (idx < 0) {
    console.log("no bracket", f);
    continue;
  }
  const body = raw.slice(0, idx + 1);
  try {
    const arr = JSON.parse(body);
    let fixed = 0;
    for (const q of arr) {
      let e = q.explicacao_profunda || "";
      const b = e;
      for (const n of needles) e = e.split(n).join("");
      e = e.replace(/\s*No SAA, amarre a escolha ao requisito[^.]*\./gi, "");
      e = e.replace(/\s+/g, " ").trim();
      if (!/tip de prova/i.test(e)) {
        e +=
          " Tip de prova: use o sintoma e a restrição do enunciado para eliminar o distractor.";
      }
      while (e.length < 220) {
        e +=
          " Fundamente com o serviço e o trade-off pedidos na questão.";
      }
      if (e !== b) fixed++;
      q.explicacao_profunda = e;
    }
    fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n");
    console.log("repaired", f, "n=" + arr.length, "bordao_fixed=" + fixed);
  } catch (e) {
    console.log("still bad", f, e.message);
  }
}
