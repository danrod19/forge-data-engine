import json
import os

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
print("part|bank_exists|notes_sync|title")
for n in ids:
    p = f"aws/parts/part-aws-{n}-content.json"
    b = f"src/data/estudo-content-bank/aws-{n}.json"
    a = json.load(open(p, encoding="utf-8"))
    ok = os.path.exists(b)
    same = "MISSING"
    if ok:
        bank = json.load(open(b, encoding="utf-8"))
        same = str(a.get("study_notes") == bank.get("study_notes"))
    print(f"aws-{n}|{ok}|{same}|{a.get('title')}")
