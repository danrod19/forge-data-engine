"""Gate de qualidade do Estudo CCNA V2 (study_notes)."""
import json
import unicodedata


def strip(t: str) -> str:
    return "".join(
        c
        for c in unicodedata.normalize("NFD", t)
        if unicodedata.category(c) != "Mn"
    )


# IDs esperados pelo gen (arquivos em v2/parts)
import os

files = sorted(
    f
    for f in os.listdir("v2/parts")
    if f.endswith("-content.json")
)
print("file|part_id|title|notes|bullets|chars|oque|quando|ex|arm|lig|stub|ok_json")
for f in files:
    p = os.path.join("v2/parts", f)
    try:
        s = json.load(open(p, encoding="utf-8"))
        ok = True
    except Exception as e:
        print(f"{f}|INVALID|{e}")
        continue
    notes = s.get("study_notes") or []
    bullets = sum(len(x.get("bullets") or []) for x in notes)
    chars = sum(len(b) for x in notes for b in (x.get("bullets") or []))
    heads = [strip(h.get("heading", "").lower()) for h in notes]
    has_oque = any("o que" in h for h in heads)
    has_quando = any("quando" in h for h in heads)
    has_ex = any("exemplo" in h or "cenario" in h or "lab" in h for h in heads)
    has_arm = any("armadilha" in h for h in heads)
    has_lig = any("simulado" in h or "trilha" in h for h in heads)
    blob = str(notes)
    stub = (
        chars < 400
        or "TODO" in blob
        or "em breve" in blob.lower()
        or "lorem" in blob.lower()
        or "neste modulo voce" in strip(blob.lower())
    )
    print(
        f,
        s.get("part_id"),
        (s.get("title") or "")[:48],
        len(notes),
        bullets,
        chars,
        has_oque,
        has_quando,
        has_ex,
        has_arm,
        has_lig,
        stub,
        ok,
        sep="|",
    )
