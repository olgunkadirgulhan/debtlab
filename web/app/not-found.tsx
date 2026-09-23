import Link from "next/link";
import { CalculatorGrid } from "@/components/Blocks";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This page doesn&apos;t exist.</h1>
      <p className="mt-3 text-muted">
        Try one of our calculators, or head back to the <Link href="/" className="text-brand underline">home page</Link>.
      </p>
      <div className="mt-10">
        <CalculatorGrid />
      </div>
    </div>
  );
}
