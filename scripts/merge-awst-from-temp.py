import json
import os
import shutil

tmpdir = os.path.join(os.environ["TEMP"], "aws_t_batches")
before = json.load(
    open(os.path.join(os.environ["TEMP"], "aws_t.json"), encoding="utf-8")
)
reviewed = []
for i in range(9):
    p = os.path.join(tmpdir, f"awst_batch_{i}_reviewed.json")
    reviewed.extend(json.load(open(p, encoding="utf-8")))

print("len", len(reviewed), "expected", len(before), flush=True)
bad = expl = enu = unch = 0
samples = []
for o, r in zip(before, reviewed):
    if (
        o["id"] != r["id"]
        or o["resposta_correta"] != r["resposta_correta"]
        or o.get("alternativas") != r.get("alternativas")
        or o.get("part_id") != r.get("part_id")
    ):
        bad += 1
        print("bad", o["id"], flush=True)
    if (o.get("explicacao_profunda") or "") != (r.get("explicacao_profunda") or ""):
        expl += 1
        if len(samples) < 5:
            samples.append(
                {
                    "id": o["id"],
                    "before": o.get("explicacao_profunda"),
                    "after": r.get("explicacao_profunda"),
                }
            )
    if (o.get("enunciado") or "") != (r.get("enunciado") or ""):
        enu += 1
    if (o.get("explicacao_profunda") or "") == (
        r.get("explicacao_profunda") or ""
    ) and (o.get("enunciado") or "") == (r.get("enunciado") or ""):
        unch += 1

print({"expl": expl, "enu": enu, "unch": unch, "bad": bad}, flush=True)
assert bad == 0
assert len(reviewed) == 360

out_tmp = os.path.join(os.environ["TEMP"], "questions_aws_traditional_reviewed.json")
with open(out_tmp, "w", encoding="utf-8") as f:
    json.dump(reviewed, f, ensure_ascii=False)
    f.write("\n")
print("wrote compact", out_tmp, flush=True)

dest = os.path.join("src", "data", "questions_aws_traditional.json")
shutil.copyfile(out_tmp, dest)
print("copied", dest, flush=True)

for mirror in (
    os.path.join("aws", "final", "questions_aws_traditional.json"),
    os.path.join("aws", "final", "questions_traditional_FINAL.json"),
):
    if os.path.isdir(os.path.dirname(mirror)):
        shutil.copyfile(out_tmp, mirror)
        print("copied", mirror, flush=True)

os.makedirs(os.path.join("scripts", "output"), exist_ok=True)
report_path = os.path.join(
    "scripts", "output", "questions_aws_traditional_review_report.md"
)
lines = [
    "# Questions AWS traditional review report\n\n",
    "## Cadeia UI\n\n",
    "```\n",
    "Simulado track aws\n",
    "  → getSimuladoPoolByTrack(\"aws\") / simuladoQuestionsAws\n",
    "  → awsTraditionalQuestions (aws-banks.ts)\n",
    "  → src/data/questions_aws_traditional.json\n\n",
    "Estudo track aws\n",
    "  → filterQuestionsForAwsDomain / getAwsTraditionalByPart\n",
    "  → mesmo questions_aws_traditional.json\n",
    "```\n\n",
    f"| Métrica | Valor |\n|---------|-------|\n| Total no pool | {len(reviewed)} |\n| Explicações reescritas | {expl} |\n| Enunciados só OCR / ajuste leve | {enu} |\n| Inalteradas (expl+enunciado) | {unch} |\n| bad gabarito | 0 |\n\n",
    "## Amostras — explicação (antes → depois)\n\n",
]
for s in samples:
    lines.append(
        f"### ID {s['id']}\n**Antes:** {s['before']}\n\n**Depois:** {s['after']}\n\n"
    )
lines.append(
    "## Invariantes\n\n"
    "- `resposta_correta` e texto das `alternativas` preservados em 100%.\n"
    "- Enunciados NÃO traduzidos EN→PT (só OCR óbvio se houver).\n"
    "- Backup: `scripts/output/questions_aws_traditional_before_review.json`\n"
)
open(report_path, "w", encoding="utf-8").write("".join(lines))
print("report", report_path, flush=True)
print("".join(lines)[:2000], flush=True)
