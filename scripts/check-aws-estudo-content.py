import json
import unicodedata

def strip(t: str) -> str:
    return "".join(
        c
        for c in unicodedata.normalize("NFD", t)
        if unicodedata.category(c) != "Mn"
    )


ids = [
    "1.1",
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.6",
    "1.7",
    "1.8",
    "1.9",
    "1.10",
    "1.11",
    "1.12",
]
print("id|notes|bullets|chars|oque|quando|ex|arm|lig|stub|wtype|ok_json")
for n in ids:
    p = f"aws/parts/part-aws-{n}-content.json"
    try:
        s = json.load(open(p, encoding="utf-8"))
        ok = True
    except Exception as e:
        print(f"aws-{n}|INVALID|{e}")
        continue
    notes = s.get("study_notes") or []
    bullets = sum(len(x.get("bullets") or []) for x in notes)
    chars = sum(len(b) for x in notes for b in (x.get("bullets") or []))
    heads = [strip(h.get("heading", "").lower()) for h in notes]
    has_oque = any("o que" in h for h in heads)
    has_quando = any("quando" in h for h in heads)
    has_ex = any("exemplo" in h or "arquitetura" in h for h in heads)
    has_arm = any("armadilha" in h for h in heads)
    has_lig = any("simulado" in h or "trilha" in h for h in heads)
    blob = str(notes)
    # Word-boundary-ish: avoid matching Portuguese "todos"
    stub = (
        chars < 400
        or "TODO" in blob
        or "em breve" in blob.lower()
        or "lorem" in blob.lower()
    )
    print(
        s.get("part_id"),
        len(notes),
        bullets,
        chars,
        has_oque,
        has_quando,
        has_ex,
        has_arm,
        has_lig,
        stub,
        type(s.get("weight_percent")).__name__,
        ok,
        sep="|",
    )
