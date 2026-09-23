"use client";

import { useMemo, useState } from "react";
import BalanceChart from "@/components/BalanceChart";
import NumberField from "@/components/Field";
import { Stat } from "@/components/Blocks";
import { duration, money, payoff, payoffDate } from "@/lib/debtMath";

const EXTRAS = [50, 100, 200];

export default function CreditCardPayoff() {
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(24);
  const [payment, setPayment] = useState(200);

  const result = useMemo(() => payoff(balance, apr, payment), [balance, apr, payment]);
  const minNeeded = Math.floor((balance * apr) / 100 / 12) + 1;
  const extras = useMemo(
    () => EXTRAS.map((x) => ({ x, r: payoff(balance, apr, payment + x) })),
    [balance, apr, payment],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="card h-fit space-y-4 p-5">
        <h2 className="font-semibold">Your card</h2>
        <NumberField label="Balance" prefix="$" value={balance} onChange={setBalance} step={100} />
        <NumberField label="APR" suffix="%" value={apr} onChange={setApr} step={0.1} />
        <NumberField label="Monthly payment" prefix="$" value={payment} onChange={setPayment} step={10} />
        <p className="text-xs text-muted">Assumes a fixed payment and no new charges.</p>
      </div>

      <div className="card p-5">
        {!result ? (
          <div className="rounded-xl bg-red/5 p-5 text-red">
            <p className="font-semibold">This payment never pays the card off.</p>
            <p className="mt-1 text-sm">
              Interest alone is about {money((balance * apr) / 100 / 12)} a month. Pay at least {money(minNeeded)} to start
              lowering the balance.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Debt-free in" value={duration(result.months)} tone="brand" />
              <Stat label="Total interest" value={money(result.totalInterest)} tone="red" />
              <Stat label="Payoff date" value={payoffDate(result.months)} />
            </div>
            <div className="mt-6">
              <BalanceChart series={[{ name: "Balance", data: result.history, color: "#0F52BA" }]} />
            </div>
            <h3 className="mt-6 mb-3 font-semibold">What if you paid a little more?</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-2 pr-4 font-medium">Monthly payment</th>
                    <th className="py-2 pr-4 font-medium">Time</th>
                    <th className="py-2 pr-4 font-medium">Interest</th>
                    <th className="py-2 font-medium">You could save</th>
                  </tr>
                </thead>
                <tbody>
                  {extras.map(({ x, r }) =>
                    r ? (
                      <tr key={x} className="border-t border-line">
                        <td className="py-2.5 pr-4 font-medium">
                          {money(payment + x)} <span className="text-muted">(+{money(x)})</span>
                        </td>
                        <td className="py-2.5 pr-4">{duration(r.months)}</td>
                        <td className="py-2.5 pr-4">{money(r.totalInterest)}</td>
                        <td className="py-2.5 font-semibold text-green">
                          {money(Math.round(result.totalInterest) - Math.round(r.totalInterest))}
                        </td>
                      </tr>
                    ) : null,
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
