"use client";

import { useState } from "react";
import { SCORE_QUESTIONS, ScoreAnswers, estimateScore } from "@/lib/debtMath";

const TIPS: Record<keyof ScoreAnswers, string> = {
  latePayments: "Payment history carries the most weight. Autopay for at least the minimum helps prevent new late marks.",
  utilization: "Paying balances down before the statement closing date lowers the utilization that gets reported.",
  history: "Keeping older accounts open (if they have no annual fee) helps the average age of your accounts.",
  newCredit: "Spacing out new applications limits hard inquiries, which usually fade after 12 months.",
  mix: "Mix is a small factor. It is rarely worth opening a new account just to improve it.",
};

export default function ScoreSimulator() {
  const [a, setA] = useState<ScoreAnswers>({ latePayments: 0, utilization: 2, history: 2, newCredit: 1, mix: 1 });
  const { score, tier } = estimateScore(a);
  const pct = (score - 300) / 550;

  const weakest = [...SCORE_QUESTIONS].sort(
    (x, y) => x.weight * (1 - x.options[a[x.key]].value) - y.weight * (1 - y.options[a[y.key]].value),
  ).reverse()[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card space-y-6 p-5">
        {SCORE_QUESTIONS.map((q, qi) => (
          <fieldset key={q.key}>
            <legend className="mb-3 font-semibold">
              <span className="mr-2 text-brand">{qi + 1}.</span>
              {q.label}
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o, oi) => {
                const on = a[q.key] === oi;
                return (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setA({ ...a, [q.key]: oi })}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      on ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand hover:text-brand"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="card h-fit p-6 text-center lg:sticky lg:top-24">
        <p className="text-sm font-medium text-muted">Estimated score</p>
        <svg viewBox="0 0 200 120" className="mx-auto mt-2 w-56" aria-hidden="true">
          <path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
          <path
            d="M20 100a80 80 0 0 1 160 0"
            fill="none"
            stroke={tier.color}
            strokeWidth="16"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct * 100} 100`}
            style={{ transition: "stroke-dasharray .4s ease, stroke .4s" }}
          />
        </svg>
        <p className="-mt-12 text-5xl font-extrabold tracking-tight" aria-live="polite">
          {score}
        </p>
        <p className="mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: tier.color }}>
          {tier.label}
        </p>
        <div className="mt-5 rounded-xl bg-page p-4 text-left text-sm">
          <p className="font-semibold">Biggest opportunity</p>
          <p className="mt-1 text-muted">{TIPS[weakest.key]}</p>
        </div>
        <p className="mt-4 text-left text-xs leading-relaxed text-muted">
          This is an educational estimate based on the publicly described weight of each factor. It is not your actual FICO® or
          VantageScore®, and lenders may see a different number.
        </p>
      </div>
    </div>
  );
}
