import json
import os
import shutil

tmpdir = os.path.join(os.environ["TEMP"], "v1t_batches")
before = json.load(
    open(
        os.path.join(
            os.environ["TEMP"], "questions_v1_traditional_ui_before_review.json"
        ),
        encoding="utf-8",
    )
)

reviewed = []
for i in range(19):
    p = os.path.join(tmpdir, f"v1t_batch_{i}_reviewed.json")
    if not os.path.exists(p):
        raise SystemExit(f"missing {p}")
    reviewed.extend(json.load(open(p, encoding="utf-8")))

print("len", len(reviewed), "expected", len(before), flush=True)
assert len(reviewed) == len(before)

bad = expl = enu = unch = 0
samples = []
by_file = {}

for o, r in zip(before, reviewed):
    if (
        o.get("id") != r.get("id")
        or o.get("resposta_correta") != r.get("resposta_correta")
        or o.get("alternativas") != r.get("alternativas")
        or (o.get("part_id") or "") != (r.get("part_id") or "")
    ):
        bad += 1
        print("bad", o.get("_sourceFile"), o.get("id"), flush=True)

    sc = (o.get("explicacao_profunda") or "") != (r.get("explicacao_profunda") or "")
    uc = (o.get("enunciado") or "") != (r.get("enunciado") or "")
    if sc:
        expl += 1
        if len(samples) < 5:
            samples.append(
                {
                    "id": o.get("id"),
                    "file": o.get("_sourceFile"),
                    "before": o.get("explicacao_profunda"),
                    "after": r.get("explicacao_profunda"),
                }
            )
    if uc:
        enu += 1
    if not sc and not uc:
        unch += 1

    file = r.get("_sourceFile") or o.get("_sourceFile")
    idx = r.get("_sourceIndex", o.get("_sourceIndex"))
    clean = {k: v for k, v in r.items() if not k.startswith("_")}
    by_file.setdefault(file, {})[idx] = clean

print({"expl": expl, "enu": enu, "unch": unch, "bad": bad}, flush=True)
assert bad == 0

for file, idx_map in by_file.items():
    arr = [idx_map[i] for i in range(len(idx_map))]
    # write via temp then copy to avoid Desktop lock hangs
    tmp_out = os.path.join(os.environ["TEMP"], "v1t_write_" + os.path.basename(file))
    with open(tmp_out, "w", encoding="utf-8") as f:
        json.dump(arr, f, ensure_ascii=False, indent=2)
        f.write("\n")
    shutil.copyfile(tmp_out, file)
    print("wrote", file, len(arr), flush=True)

os.makedirs(os.path.join("scripts", "output"), exist_ok=True)
report = os.path.join("scripts", "output", "questions_v1_traditional_review_report.md")
lines = [
    "# Questions V1 traditional (UI pool) review report\n\n",
    "## Cadeia UI\n\n",
    "```\n",
    "Simulado track ccna-v1\n",
    "  → getSimuladoPoolByTrack(\"ccna-v1\") → simuladoQuestionsCurated\n",
    "  → mergeByEnunciado(module1…module6 traditional)\n\n",
    "Estudo track ccna-v1\n",
    "  → getStudyPartsForTrack(\"ccna-v1\") / getPartQuestions(part_id)\n",
    "  → module1-traditional (parts 1.1–1.6 + drill 1.4)\n",
    "  → module2…6-traditional JSON\n",
    "```\n\n",
    "**Fora do escopo (UI não usa como pool V1 primário):** `questions_traditional_FINAL.json`, `tickets_*`, V2/AWS.\n\n",
    f"| Métrica | Valor |\n|---------|-------|\n| Total no pool UI V1 | {len(reviewed)} |\n| Explicações reescritas | {expl} |\n| Enunciados só OCR | {enu} |\n| Inalteradas | {unch} |\n| bad gabarito | 0 |\n\n",
    "## Amostras — explicação (antes → depois)\n\n",
]
for s in samples:
    lines.append(
        f"### ID {s['id']} (`{s['file']}`)\n**Antes:** {s['before']}\n\n**Depois:** {s['after']}\n\n"
    )
lines.append(
    "## Invariantes\n\n"
    "- `resposta_correta` e `alternativas` 100% preservados.\n"
    "- Enunciados não traduzidos EN→PT.\n"
    "- Backup: `scripts/output/questions_v1_traditional_ui_before_review.json`\n"
)
open(report, "w", encoding="utf-8").write("".join(lines))
print("report", report, flush=True)
print("".join(lines)[:1800], flush=True)
