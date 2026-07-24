import json
from pathlib import Path

p = Path(__file__).parent / "questions_bulk_completo (1).json"
j = json.loads(p.read_text(encoding="utf-8"))
qs = [x for x in j if 16 <= x.get("id", -1) <= 90]
out = Path(__file__).parent / "generated"
out.mkdir(parents=True, exist_ok=True)
(out / "_source_16_90.json").write_text(
    json.dumps(qs, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("saved", len(qs))
for x in qs:
    alts = x.get("alternativas") or []
    print(
        x["id"],
        "rc",
        x.get("resposta_correta"),
        "alts",
        len(alts),
        "en",
        len(x.get("enunciado") or ""),
    )
