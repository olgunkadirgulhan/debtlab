import { PageIntro } from "@/components/Blocks";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <PageIntro title={title}>
        <span className="text-sm">Last updated {updated}</span>
      </PageIntro>
      <div className="prose card p-6 sm:p-8">{children}</div>
    </div>
  );
}
