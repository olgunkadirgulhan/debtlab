import type { Metadata } from "next";
import CalculatorPage from "@/components/CalculatorPage";
import MultiDebt from "@/components/MultiDebt";

const HREF = "/calculators/debt-avalanche/";

export const metadata: Metadata = {
  title: "Debt Avalanche Calculator: Pay Less Interest",
  description:
    "Free debt avalanche calculator. Pay the highest APR first, see your debt-free date and how much interest you could save compared with the snowball method.",
  alternates: { canonical: HREF },
};

export default function Page() {
  return (
    <CalculatorPage
      href={HREF}
      eyebrow="Debt avalanche"
      title="Debt Avalanche Calculator"
      intro="Target the most expensive debt first. Enter your debts and an extra monthly amount to see your debt-free date, the interest you would pay, and how it compares with the snowball."
      calculator={<MultiDebt strategy="avalanche" />}
      article={
        <>
          <h2>How the debt avalanche works</h2>
          <p>
            You pay the minimum on every debt and send every extra dollar to the debt with the <strong>highest interest rate</strong>. Once
            it is paid off, its payment moves to the next highest rate. Because the most expensive balance shrinks first, less interest
            builds up over the life of your plan.
          </p>
          <h2>When the avalanche saves the most</h2>
          <p>
            The gap between avalanche and snowball grows when your rates are far apart, for example a 29% store card next to a 7% car
            loan, and when the high-rate debt also has a large balance. When rates are close, the two methods end up nearly the same and
            the snowball&apos;s quicker first win may be worth more to you.
          </p>
          <h2>Tips to make it work</h2>
          <ul>
            <li>Set the extra payment to go out automatically right after payday.</li>
            <li>Keep paying the same total each month even as balances drop.</li>
            <li>If a card offers a lower promotional rate, re-run the numbers: the order can change.</li>
            <li>Avoid new charges on cards you are paying down, or the plan&apos;s timeline will slip.</li>
          </ul>
        </>
      }
      faq={[
        {
          q: "How much can the debt avalanche save?",
          a: "It depends on how far apart your interest rates are and how big each balance is. Enter your debts above: the comparison box shows the exact difference in interest and time for your numbers.",
        },
        {
          q: "What if two debts have the same APR?",
          a: "Either order works. Many people pay the smaller of the two first to free up its minimum payment sooner.",
        },
        {
          q: "Should I use savings to pay down high-APR debt?",
          a: "Many people keep a small emergency fund first so a surprise expense does not go on a credit card. Beyond that, the right balance depends on your situation; consider talking with a qualified professional.",
        },
        {
          q: "Is this the same as debt consolidation?",
          a: "No. The avalanche is a payoff order for the debts you already have. Consolidation replaces several debts with one new loan, ideally at a lower rate.",
        },
      ]}
    />
  );
}
