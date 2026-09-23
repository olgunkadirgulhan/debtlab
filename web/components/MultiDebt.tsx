"use client";

import { useMemo, useState } from "react";
import BalanceChart from "@/components/BalanceChart";
import NumberField from "@/components/Field";
import Icon from "@/components/Icon";
import { Stat } from "@/components/Blocks";
import { Debt, Strategy, duration, money, multiPayoff, payoffDate } from "@/lib/debtMath";

const START: Debt[] = [
  { name: "Store card", balance: 1200, apr: 18.99, min: 35 },
  { name: "Visa", balance: 6800, apr: 27.49, min: 170 },
  { name: "Car loan", balance: 9500, apr: 7.9, min: 285 },
];

const LABEL: Record<Strategy, string> = { snowball: "Snowball", avalanche: "Avalanche" };
const COLOR: Record<Strategy, string> = { snowball: "#0F52BA", avalanche: "#16A34A" };

export default function MultiDebt({ strategy }: { strategy: Strategy }) {
  const other: Strategy = strategy === "snowball" ? "avalanche" : "snowball";
  const [debts, setDebts] = useState<Debt[]>(START);
  const [extra, setExtra] = useState(200);

  const valid = debts.filter((d) => d.balance > 0);
  const minTotal = valid.reduce((s, d) => s + d.min, 0);
  const budget = minTotal + extra;

  const res = useMemo(() => {
    const active = debts.filter((d) => d.balance > 0);
    return { snowball: multiPayoff(active, budget, "snowball"), avalanche: multiPayoff(active, budget, "avalanche") };
  }, [debts, budget]);
  const mine = res[strategy];
  const theirs = res[other];

  const update = (i: number, patch: Partial<Debt>) => setDebts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const remove = (i: number) => setDebts((ds) => ds.filter((_, j) => j !== i));
  const add = () => setDebts((ds) => [...ds, { name: `Debt ${ds.length + 1}`, balance: 2000, apr: 19.99, min: 50 }]);

  let verdict = "";
  if (mine && theirs) {
    const diff = Math.round(theirs.totalInterest) - Math.round(mine.totalInterest);
    if (diff > 0) verdict = `${LABEL[strategy]} saves ${money(diff)} in interest compared with ${LABEL[other].toLowerCase()}.`;
    else if (diff < 0) verdict = `${LABEL[other]} would save ${money(-diff)} more interest here, but ${LABEL[strategy].toLowerCase()} can still be worth it if early wins keep you going.`;
    else verdict = "Both methods cost the same with these debts.";
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Your debts</h2>
          <span className="text-sm text-muted">Minimums: {money(minTotal)}/mo</span>
        </div>
        <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.9fr_40px] gap-3 px-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
          <span>Name</span>
          <span>Balance</span>
          <span>APR</span>
          <span>Minimum</span>
          <span />
        </div>
        <div className="space-y-3">
          {debts.map((d, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 rounded-xl bg-page p-3 sm:grid-cols-[1.4fr_1fr_0.8fr_0.9fr_40px] sm:bg-transparent sm:p-0">
              <label className="col-span-2 block sm:col-span-1">
                <span className="sr-only">Name</span>
                <input className="field" value={d.name} onChange={(e) => update(i, { name: e.target.value })} />
              </label>
              <NumberField compact label={`Balance ${i + 1}`} prefix="$" value={d.balance} onChange={(v) => update(i, { balance: v })} step={100} />
              <NumberField compact label={`APR ${i + 1}`} suffix="%" value={d.apr} onChange={(v) => update(i, { apr: v })} step={0.1} />
              <NumberField compact label={`Minimum ${i + 1}`} prefix="$" value={d.min} onChange={(v) => update(i, { min: v })} step={5} />
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={debts.length <= 1}
                className="grid h-11 place-items-center rounded-lg text-muted hover:bg-red/10 hover:text-red disabled:opacity-30"
                aria-label={`Remove ${d.name}`}
              >
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <button type="button" onClick={add} className="btn btn-ghost text-sm" disabled={debts.length >= 10}>
            <Icon name="plus" className="h-4 w-4" /> Add debt
          </button>
          <div className="w-full sm:w-64">
            <NumberField label="Extra payment each month" prefix="$" value={extra} onChange={setExtra} step={25} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        {!mine ? (
          <p className="rounded-xl bg-red/5 p-4 text-red">
            With these numbers the debts don&apos;t get paid off within 50 years. Raise the extra payment or the minimums.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Debt-free in" value={duration(mine.months)} tone="brand" />
              <Stat label="Total interest" value={money(mine.totalInterest)} tone="red" />
              <Stat label="Debt-free date" value={payoffDate(mine.months)} />
            </div>

            {theirs && (
              <div className="mt-5 rounded-xl border border-green/30 bg-green-soft p-4">
                <p className="font-semibold text-green">{verdict}</p>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {(["snowball", "avalanche"] as Strategy[]).map((s) => (
                    <div key={s} className="flex justify-between rounded-lg bg-white px-3 py-2">
                      <span className="font-medium">{LABEL[s]}</span>
                      <span>
                        {duration(res[s]!.months)} · {money(res[s]!.totalInterest)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <BalanceChart
                series={(["snowball", "avalanche"] as Strategy[])
                  .filter((s) => res[s])
                  .map((s) => ({ name: LABEL[s], data: res[s]!.history, color: COLOR[s] }))}
              />
            </div>

            <h3 className="mt-6 mb-3 font-semibold">Your {LABEL[strategy].toLowerCase()} payoff order</h3>
            <ol className="space-y-2">
              {mine.payoffOrder.map((o, i) => (
                <li key={o.name} className="flex items-center gap-3 rounded-lg bg-page px-3 py-2.5 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className="font-medium">{o.name}</span>
                  <span className="ml-auto text-muted">paid off {payoffDate(o.month)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
