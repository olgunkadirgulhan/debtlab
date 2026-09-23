// TypeScript port of shared/debt_math.py. Keep the two in sync: the videos and
// the site must show the same numbers for the same inputs.

export const MAX_MONTHS = 600;

export type PayoffResult = { months: number; totalInterest: number; history: number[] };

export function payoff(balance: number, apr: number, payment: number, maxMonths = MAX_MONTHS): PayoffResult | null {
  const r = apr / 100 / 12;
  let months = 0;
  let interest = 0;
  const history = [round2(balance)];
  while (balance > 0.005 && months < maxMonths) {
    const i = balance * r;
    if (payment <= i) return null;
    interest += i;
    balance = Math.max(0, balance + i - payment);
    months++;
    history.push(round2(balance));
  }
  return { months, totalInterest: round2(interest), history };
}

export type Debt = { name: string; balance: number; apr: number; min: number };
export type Strategy = "snowball" | "avalanche";
export type MultiResult = PayoffResult & { payoffOrder: { name: string; month: number }[] };

export function multiPayoff(debts: Debt[], budget: number, strategy: Strategy, maxMonths = MAX_MONTHS): MultiResult | null {
  const key = strategy === "snowball" ? (d: Debt) => d.balance : (d: Debt) => -d.apr;
  const ds = debts.filter((d) => d.balance > 0).map((d) => ({ ...d })).sort((a, b) => key(a) - key(b));
  if (!ds.length || budget < ds.reduce((s, d) => s + d.min, 0)) return null;
  let months = 0;
  let interest = 0;
  const history = [round2(sum(ds.map((d) => d.balance)))];
  const order: { name: string; month: number }[] = [];
  while (ds.some((d) => d.balance > 0.005) && months < maxMonths) {
    for (const d of ds) {
      if (d.balance > 0) {
        const i = (d.balance * d.apr) / 100 / 12;
        d.balance += i;
        interest += i;
      }
    }
    let left = budget;
    for (const d of ds) {
      if (d.balance > 0) {
        const pay = Math.min(d.min, d.balance);
        d.balance -= pay;
        left -= pay;
      }
    }
    for (const d of ds) {
      if (left <= 0) break;
      if (d.balance > 0) {
        const pay = Math.min(left, d.balance);
        d.balance -= pay;
        left -= pay;
      }
    }
    months++;
    for (const d of ds) {
      if (d.balance <= 0.005 && !order.some((o) => o.name === d.name)) {
        d.balance = 0;
        order.push({ name: d.name, month: months });
      }
    }
    history.push(round2(sum(ds.map((d) => d.balance))));
  }
  if (months >= maxMonths) return null;
  return { months, totalInterest: round2(interest), history, payoffOrder: order };
}

export type ScoreAnswers = {
  latePayments: number; // index into SCORE_QUESTIONS[0].options
  utilization: number;
  history: number;
  newCredit: number;
  mix: number;
};

// Educational approximation using the publicly described FICO category weights.
export const SCORE_QUESTIONS = [
  {
    key: "latePayments",
    weight: 0.35,
    label: "Late payments (30+ days) in the last 2 years?",
    options: [
      { label: "None", value: 1 },
      { label: "1", value: 0.7 },
      { label: "2-3", value: 0.45 },
      { label: "4 or more / collections", value: 0.15 },
    ],
  },
  {
    key: "utilization",
    weight: 0.3,
    label: "Credit card balances vs. total limits?",
    options: [
      { label: "Under 10%", value: 1 },
      { label: "10-29%", value: 0.85 },
      { label: "30-49%", value: 0.6 },
      { label: "50-74%", value: 0.4 },
      { label: "75% or more", value: 0.2 },
    ],
  },
  {
    key: "history",
    weight: 0.15,
    label: "Age of your oldest account?",
    options: [
      { label: "Under 1 year", value: 0.3 },
      { label: "1-3 years", value: 0.55 },
      { label: "3-7 years", value: 0.75 },
      { label: "7+ years", value: 1 },
    ],
  },
  {
    key: "newCredit",
    weight: 0.1,
    label: "Credit applications in the last 12 months?",
    options: [
      { label: "None", value: 1 },
      { label: "1-2", value: 0.8 },
      { label: "3-4", value: 0.5 },
      { label: "5 or more", value: 0.25 },
    ],
  },
  {
    key: "mix",
    weight: 0.1,
    label: "Types of credit you have?",
    options: [
      { label: "Credit cards and loans", value: 1 },
      { label: "Credit cards only", value: 0.7 },
      { label: "Loans only", value: 0.6 },
      { label: "None yet", value: 0.3 },
    ],
  },
] as const;

export const SCORE_TIERS = [
  { min: 800, label: "Exceptional", color: "#16A34A" },
  { min: 740, label: "Very good", color: "#22C55E" },
  { min: 670, label: "Good", color: "#0F52BA" },
  { min: 580, label: "Fair", color: "#F59E0B" },
  { min: 300, label: "Poor", color: "#DC2626" },
];

export function estimateScore(a: ScoreAnswers) {
  const total = SCORE_QUESTIONS.reduce((s, q) => s + q.weight * q.options[a[q.key]].value, 0);
  const score = Math.round(300 + 550 * total);
  const tier = SCORE_TIERS.find((t) => score >= t.min)!;
  return { score, tier };
}

export function round2(x: number) {
  return Math.round(x * 100) / 100;
}

function sum(xs: number[]) {
  return xs.reduce((s, x) => s + x, 0);
}

export function money(x: number) {
  return "$" + Math.round(x).toLocaleString("en-US");
}

export function duration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const ys = `${y} year${y === 1 ? "" : "s"}`;
  const ms = `${m} month${m === 1 ? "" : "s"}`;
  if (y && m) return `${ys}, ${ms}`;
  return y ? ys : ms;
}

export function payoffDate(months: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
