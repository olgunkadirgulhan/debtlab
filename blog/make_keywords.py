"""Builds blog/keywords.csv: search-style keywords, each tied to a computed scenario.

Evergreen head terms come first, then long-tail variations. Existing rows are kept.

    python blog/make_keywords.py
"""
import csv
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "shared"))
import debt_math as dm  # noqa: E402

OUT = Path(__file__).resolve().parent / "keywords.csv"


def m(x):
    return f"${x:,}"


def p(**kw):
    return json.dumps(kw, separators=(",", ":"))


SNOW_A = [
    {"name": "Store card", "balance": 1200, "apr": 18.99, "min": 35},
    {"name": "Visa", "balance": 6800, "apr": 27.49, "min": 170},
    {"name": "Car loan", "balance": 9500, "apr": 7.9, "min": 285},
]
SNOW_B = [
    {"name": "Card A", "balance": 2500, "apr": 24.99, "min": 65},
    {"name": "Card B", "balance": 7400, "apr": 29.99, "min": 185},
    {"name": "Personal loan", "balance": 5200, "apr": 11.5, "min": 160},
    {"name": "Store card", "balance": 900, "apr": 26.99, "min": 30},
]

EVERGREEN = [
    ("debt snowball vs debt avalanche", "snowball_vs_avalanche", p(debts=SNOW_A, budget=690)),
    ("how to pay off credit card debt fast", "extra_payment", p(balance=8000, apr=24, payment=240, extra=150)),
    ("what is credit utilization", "utilization", p(balance=2400, limit=5000)),
    ("why paying the minimum on a credit card is a trap", "min_trap", p(balance=5000, apr=24, min_pct=1, min_floor=25)),
    ("debt avalanche method explained", "snowball_vs_avalanche", p(debts=SNOW_B, budget=640)),
    ("how does credit card interest work", "extra_payment", p(balance=3000, apr=22, payment=120, extra=50)),
    ("how to lower credit utilization fast", "utilization", p(balance=3600, limit=6000)),
    ("debt snowball method explained", "snowball_vs_avalanche", p(debts=SNOW_B, budget=540)),
    ("how long does it take to pay off credit card debt", "min_trap", p(balance=7500, apr=22, min_pct=1, min_floor=25)),
    ("is it better to pay off the smallest debt or highest interest first", "snowball_vs_avalanche", p(debts=SNOW_A, budget=790)),
]


def longtail(rng):
    rows = []
    for b in [1000, 2000, 3000, 4000, 5000, 7500, 10000, 12000, 15000, 20000, 25000, 30000]:
        apr = rng.choice([19, 21, 22, 24, 26, 28])
        rows.append((f"how long to pay off {m(b)} in credit card debt with minimum payments", "min_trap",
                     p(balance=b, apr=apr, min_pct=1, min_floor=25)))
        pay = max(50, int(round(b * 0.03 / 10) * 10))
        extra = rng.choice([50, 100, 150, 200])
        if dm.compare(b, apr, pay, extra):
            rows.append((f"how to pay off {m(b)} credit card debt", "extra_payment", p(balance=b, apr=apr, payment=pay, extra=extra)))
            rows.append((f"paying {m(pay + extra)} a month on {m(b)} credit card", "extra_payment",
                         p(balance=b, apr=apr, payment=pay, extra=extra)))
    for lim in [1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000]:
        u = rng.choice([45, 50, 60, 70, 80, 90])
        bal = int(lim * u / 100)
        rows.append((f"credit utilization on a {m(lim)} credit limit", "utilization", p(balance=bal, limit=lim)))
        rows.append((f"is {u} percent credit utilization bad", "utilization", p(balance=bal, limit=lim)))
    for n, debts, budget in [(3, SNOW_A, 890), (4, SNOW_B, 840)]:
        rows.append((f"debt snowball example with {n} debts", "snowball_vs_avalanche", p(debts=debts, budget=budget)))
        rows.append((f"debt avalanche example with {n} debts", "snowball_vs_avalanche", p(debts=debts, budget=budget - 150)))
    rng.shuffle(rows)
    return rows


def main():
    existing = []
    if OUT.exists():
        with OUT.open(newline="", encoding="utf-8") as f:
            existing = list(csv.DictReader(f))
    seen = {r["keyword"] for r in existing}
    rows = existing[:]
    for kw, pillar, params in EVERGREEN + longtail(random.Random(7)):
        if kw not in seen:
            seen.add(kw)
            rows.append({"keyword": kw, "pillar": pillar, "params": params})
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["keyword", "pillar", "params"])
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} keywords")


if __name__ == "__main__":
    main()
