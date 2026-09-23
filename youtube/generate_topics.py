"""Generates youtube/topics.csv: ~600 non-repeating, pre-validated scenarios.

Run once (or again with a new --seed to append more). Rows that already exist
are kept, so published history stays consistent.

    python youtube/generate_topics.py --count 600
"""
import argparse
import csv
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "shared"))
import debt_math as dm  # noqa: E402

TOPICS = Path(__file__).resolve().parent / "topics.csv"
FIELDS = ["id", "pillar", "title", "params"]


def money(x):
    return f"${x:,.0f}"


TEMPLATES = {
    "min_trap": [
        "Paying only the minimum on {b} takes HOW long?",
        "{b} at {apr}% APR, minimum payments only. Brutal math",
        "The minimum payment trap on {b} of credit card debt",
        "Why your {b} card balance never goes down",
        "What the minimum payment really costs on {b}",
    ],
    "extra_payment": [
        "{b} credit card debt at {apr}% APR? Do this",
        "Add {x} a month to a {b} balance. Watch what happens",
        "How {x} extra per month kills {b} of debt faster",
        "{b} at {apr}%: paying {p} vs {p2} a month",
        "The {x} trick that saves months on {b} of debt",
    ],
    "snowball_vs_avalanche": [
        "Snowball vs Avalanche on {total}. Which wins?",
        "{n} debts, {total} total. Snowball or Avalanche?",
        "Debt Snowball vs Avalanche: the real numbers on {total}",
        "I ran the math on {n} debts. Snowball vs Avalanche",
        "Smallest balance first or highest APR first? {total} test",
    ],
    "utilization": [
        "Your {b} balance on a {l} limit is hurting your score",
        "How much to pay to get under 30% utilization on a {l} card",
        "{u}% credit utilization? Here is the fix",
        "The credit utilization math on a {l} limit",
        "Pay this much before your statement closes ({b} on {l})",
    ],
}


def round_to(x, step):
    return int(round(x / step) * step)


def make_min_trap(rng):
    b = round_to(rng.uniform(1000, 25000), 250)
    apr = rng.randint(15, 29)
    params = {"balance": b, "apr": apr, "min_pct": 1, "min_floor": 25}
    r = dm.payoff_minimum(b, apr, 1, 25)
    if r["months"] < 60 or r["months"] >= dm.MAX_MONTHS:
        return None
    t = rng.choice(TEMPLATES["min_trap"])
    return params, t.format(b=money(b), apr=apr)


def make_extra_payment(rng):
    b = round_to(rng.uniform(1000, 50000), 250)
    apr = rng.randint(15, 29)
    p = max(50, round_to(b * rng.uniform(0.025, 0.04), 10))
    x = rng.choice([25, 50, 75, 100, 150, 200, 250, 300, 400, 500])
    if x > p:
        x = round_to(p * 0.5, 25) or 25
    c = dm.compare(b, apr, p, x)
    if c is None or c["months_saved"] < 3:
        return None
    params = {"balance": b, "apr": apr, "payment": p, "extra": x}
    t = rng.choice(TEMPLATES["extra_payment"])
    return params, t.format(b=money(b), apr=apr, x=money(x), p=money(p), p2=money(p + x))


CARD_NAMES = ["Card A", "Card B", "Store card", "Card C", "Personal loan", "Card D"]


def make_snowball(rng):
    n = rng.randint(2, 5)
    names = rng.sample(CARD_NAMES, n)
    debts = []
    for name in names:
        b = round_to(rng.uniform(500, 15000), 100)
        apr = rng.randint(12, 29)
        debts.append({"name": name, "balance": b, "apr": apr, "min": max(25, round_to(b * 0.025, 5))})
    budget = sum(d["min"] for d in debts) + rng.choice([100, 150, 200, 300, 400, 500, 600])
    c = dm.snowball_vs_avalanche(debts, budget)
    if c is None:
        return None
    total = sum(d["balance"] for d in debts)
    params = {"debts": debts, "budget": budget}
    t = rng.choice(TEMPLATES["snowball_vs_avalanche"])
    return params, t.format(total=money(total), n=n)


def make_utilization(rng):
    l = rng.choice([1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 12000, 15000, 20000])
    u = rng.randint(35, 95)
    b = round_to(l * u / 100, 50)
    r = dm.utilization(b, l)
    if r["utilization_pct"] <= 30:
        return None
    params = {"balance": b, "limit": l}
    t = rng.choice(TEMPLATES["utilization"])
    return params, t.format(b=money(b), l=money(l), u=round(r["utilization_pct"]))


MAKERS = {
    "min_trap": make_min_trap,
    "extra_payment": make_extra_payment,
    "snowball_vs_avalanche": make_snowball,
    "utilization": make_utilization,
}


def load_existing():
    if not TOPICS.exists():
        return []
    with TOPICS.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=600, help="new rows to add")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    rows = load_existing()
    titles = {r["title"] for r in rows}
    next_id = max((int(r["id"]) for r in rows), default=0) + 1
    pillars = list(MAKERS)
    added, attempts = 0, 0
    while added < args.count and attempts < args.count * 50:
        attempts += 1
        pillar = pillars[added % len(pillars)]
        made = MAKERS[pillar](rng)
        if not made:
            continue
        params, title = made
        if title in titles:
            continue
        titles.add(title)
        rows.append({"id": next_id, "pillar": pillar, "title": title, "params": json.dumps(params, separators=(",", ":"))})
        next_id += 1
        added += 1

    with TOPICS.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    print(f"added {added} topics, total {len(rows)}")


if __name__ == "__main__":
    main()
