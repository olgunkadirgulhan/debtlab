"""DebtLab calculation engine. Video, site and app all use the same logic.

Every function returns plain dicts/lists so results can go straight into JSON
(Gemini prompt, chart data, blog tables).
"""

MAX_MONTHS = 600


def payoff(balance, apr, payment, max_months=MAX_MONTHS):
    """Fixed monthly payment. Returns None if the payment never covers interest."""
    r = apr / 100 / 12
    months, interest = 0, 0.0
    history = [round(balance, 2)]
    while balance > 0.005 and months < max_months:
        i = balance * r
        if payment <= i:
            return None
        interest += i
        balance = max(0.0, balance + i - payment)
        months += 1
        history.append(round(balance, 2))
    return {"months": months, "total_interest": round(interest, 2), "history": history}


def payoff_minimum(balance, apr, pct=1.0, floor=25.0, max_months=MAX_MONTHS):
    """Card-issuer style minimum: pct% of balance + that month's interest, at least `floor`.

    The minimum shrinks as the balance shrinks, which is why minimum-only payoff
    takes so long.
    """
    r = apr / 100 / 12
    months, interest = 0, 0.0
    first_payment = None
    history = [round(balance, 2)]
    while balance > 0.005 and months < max_months:
        i = balance * r
        pay = min(balance + i, max(floor, balance * pct / 100 + i))
        if first_payment is None:
            first_payment = round(pay, 2)
        interest += i
        balance = max(0.0, balance + i - pay)
        months += 1
        history.append(round(balance, 2))
    return {
        "months": months,
        "total_interest": round(interest, 2),
        "first_payment": first_payment,
        "history": history,
    }


def compare(balance, apr, min_pay, extra):
    base = payoff(balance, apr, min_pay)
    fast = payoff(balance, apr, min_pay + extra)
    if base is None or fast is None:
        return None
    # differences use whole dollars so on-screen numbers always subtract exactly
    return {
        "min_only": base,
        "with_extra": fast,
        "months_saved": base["months"] - fast["months"],
        "interest_saved": round(base["total_interest"]) - round(fast["total_interest"]),
    }


def multi_payoff(debts, budget, strategy, max_months=MAX_MONTHS):
    """Pay every minimum each month, send the rest to the first debt in priority order.

    debts: [{"name", "balance", "apr", "min"}]
    strategy: "snowball" (smallest balance first) or "avalanche" (highest APR first)
    Freed-up minimums roll into the next debt automatically because `budget` stays fixed.
    """
    key = (lambda d: d["balance"]) if strategy == "snowball" else (lambda d: -d["apr"])
    ds = [dict(d) for d in sorted(debts, key=key)]
    if budget < sum(d["min"] for d in ds):
        return None
    months, interest = 0, 0.0
    history = [round(sum(d["balance"] for d in ds), 2)]
    order = []
    while any(d["balance"] > 0.005 for d in ds) and months < max_months:
        for d in ds:
            if d["balance"] > 0:
                i = d["balance"] * d["apr"] / 100 / 12
                d["balance"] += i
                interest += i
        left = budget
        for d in ds:
            if d["balance"] > 0:
                pay = min(d["min"], d["balance"])
                d["balance"] -= pay
                left -= pay
        for d in ds:
            if left <= 0:
                break
            if d["balance"] > 0:
                pay = min(left, d["balance"])
                d["balance"] -= pay
                left -= pay
        months += 1
        for d in ds:
            if d["balance"] <= 0.005 and d["name"] not in order:
                d["balance"] = 0.0
                order.append(d["name"])
        history.append(round(sum(d["balance"] for d in ds), 2))
    if months >= max_months:
        return None
    return {"months": months, "total_interest": round(interest, 2), "payoff_order": order, "history": history}


def snowball_vs_avalanche(debts, budget):
    sb = multi_payoff(debts, budget, "snowball")
    av = multi_payoff(debts, budget, "avalanche")
    if sb is None or av is None:
        return None
    return {
        "snowball": sb,
        "avalanche": av,
        "interest_diff": round(sb["total_interest"]) - round(av["total_interest"]),
        "months_diff": sb["months"] - av["months"],
    }


def utilization(balance, limit):
    """Credit utilization and how much to pay to get under common thresholds."""
    util = balance / limit * 100
    return {
        "utilization_pct": round(util, 1),
        "pay_to_30": round(max(0.0, balance - limit * 0.30), 2),
        "pay_to_10": round(max(0.0, balance - limit * 0.10), 2),
    }
