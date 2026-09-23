import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/Blocks";
import { allPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog: Debt Payoff Guides With Real Numbers",
  description: "Step-by-step debt payoff guides, credit card math and credit score explainers, each with calculated examples.",
  alternates: { canonical: "/blog/" },
};

export default function BlogIndex() {
  const posts = allPosts();
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10">
      <PageIntro eyebrow="Blog" title="Debt payoff guides, with the math shown">
        Every article works through a real example with calculated numbers, so you can see how the strategy plays out.
      </PageIntro>
      {posts.length === 0 ? (
        <p className="card p-6 text-muted">The first articles are on their way.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}/`} className="card block p-6 transition hover:border-brand">
              <p className="text-xs text-muted">{formatDate(p.date)} · {p.minutes} min read</p>
              <h2 className="mt-2 text-xl font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 text-muted">{p.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
