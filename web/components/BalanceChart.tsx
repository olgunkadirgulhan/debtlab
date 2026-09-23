"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/debtMath";

export type Series = { name: string; data: number[]; color: string };

function compact(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return `$${Math.round(v)}`;
}

export default function BalanceChart({ series, height = 300 }: { series: Series[]; height?: number }) {
  const len = Math.max(...series.map((s) => s.data.length));
  const rows = Array.from({ length: len }, (_, m) => {
    const row: Record<string, number | null> = { month: m };
    for (const s of series) row[s.name] = m < s.data.length ? s.data[m] : null;
    return row;
  });
  const yearTicks = len > 36;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            type="number"
            domain={[0, len - 1]}
            tickCount={7}
            tickFormatter={(m) => (yearTicks ? `${Math.round(m / 12)}y` : `${m}m`)}
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis tickFormatter={compact} stroke="#94a3b8" fontSize={12} width={52} />
          <Tooltip
            formatter={(v) => money(Number(v))}
            labelFormatter={(m) => `Month ${m}`}
            contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
          />
          {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />}
          {series.map((s) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={3} dot={false} connectNulls={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
