import Link from "next/link";
import { AdSlot, CalculatorGrid, Ctas, Faq } from "@/components/Blocks";
import Icon from "@/components/Icon";
import ShortCard from "@/components/ShortCard";
import { allPosts, formatDate } from "@/lib/blog";
import { payoffDate } from "@/lib/debtMath";
import { LINKS, VIDEOS } from "@/lib/site";

export default function Home() {
  const posts = allPosts().slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(60rem 30rem at 85% -10%, var(--brand-soft), transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-soft px-3 py-1 text-sm font-semibold text-green">
              <Icon name="check" className="h-4 w-4" /> Free · No sign-up · Private
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Pay off your debt faster. <span className="text-brand">See exactly when.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Plug in your balances and get a month-by-month plan: your debt-free date, the interest you&apos;ll pay, and how much a
              little extra each month could save.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calculators/debt-snowball/" className="btn btn-primary">
                Build my payoff plan <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link href="/calculators/credit-card-payoff/" className="btn btn-ghost">
                Credit card calculator
              </Link>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <AdSlot id="ads-top" />

        <section id="calculators" className="scroll-mt-24 pt-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Free debt calculators</h2>
          <p className="mt-2 mb-6 text-muted">Everything runs in your browser. Nothing you type leaves your device.</p>
          <CalculatorGrid />
        </section>

        {VIDEOS.length > 0 && (
          <section className="pt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Debt math in 60 seconds</h2>
                <p className="mt-2 text-muted">Real scenarios, real numbers. New Shorts every day.</p>
              </div>
              {LINKS.youtube_channel && (
                <a href={LINKS.youtube_channel} rel="noopener" className="btn btn-ghost text-sm">
                  <Icon name="play" className="h-4 w-4" /> Watch on YouTube
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {VIDEOS.slice(0, 6).map((v) => (
                <ShortCard key={v.id} id={v.id} title={v.title} />
              ))}
            </div>
          </section>
        )}

        <AdSlot id="ads-in-content" />

        {posts.length > 0 && (
          <section className="pt-16">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">From the blog</h2>
              <Link href="/blog/" className="text-sm font-semibold text-brand">All articles →</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}/`} className="card p-5 transition hover:border-brand">
                  <p className="text-xs text-muted">{formatDate(p.date)} · {p.minutes} min read</p>
                  <h3 className="mt-2 font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pt-16">
          <Ctas />
        </section>

        <Faq
          items={[
            {
              q: "What is the fastest way to pay off debt?",
              a: "Pay more than the minimums and aim the extra at one debt at a time. The avalanche method (highest APR first) usually costs the least interest; the snowball (smallest balance first) gives quicker wins. Our calculators show both for your numbers.",
            },
            {
              q: "Are these calculators really free?",
              a: "Yes. There is no sign-up, and your numbers never leave your browser.",
            },
            {
              q: "How accurate are the results?",
              a: "They use standard monthly interest math and assume fixed payments and no new charges. Your lender's figures can differ slightly because of daily interest, fees, or changing rates.",
            },
          ]}
        />
      </div>
    </>
  );
}

function HeroPreview() {
  const bars = [100, 86, 73, 61, 50, 40, 31, 23, 16, 10, 5, 0];
  return (
    <div className="card relative p-6 shadow-2xl shadow-brand/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Debt-free date</p>
          <p className="text-2xl font-extrabold tracking-tight">{payoffDate(42)}</p>
        </div>
        <span className="rounded-full bg-green-soft px-3 py-1 text-sm font-semibold text-green">−$4,212 interest</span>
      </div>
      <div className="mt-6 flex h-40 items-end gap-2" aria-hidden="true">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-brand" style={{ height: `${Math.max(h, 3)}%`, opacity: 0.35 + (i / bars.length) * 0.65 }} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
        {[
          ["Store card", payoffDate(7)],
          ["Visa", payoffDate(19)],
          ["Car loan", payoffDate(42)],
        ].map(([n, d]) => (
          <div key={n} className="rounded-lg bg-page px-2 py-2">
            <p className="font-semibold">{n}</p>
            <p className="text-xs text-muted">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">Example plan</p>
    </div>
  );
}
