import type { Metadata } from "next";
import CalculatorPage from "@/components/CalculatorPage";
import MultiDebt from "@/components/MultiDebt";

const HREF = "/calculators/debt-snowball/";

export const metadata: Metadata = {
  title: "Debt Snowball Calculator: Find Your Debt-Free Date",
  description:
    "Free debt snowball calculator. Enter your debts, see the order to pay them off, your debt-free date and total interest, and compare with the avalanche method.",
  alternates: { canonical: HREF },
};

export default function Page() {
  return (
    <CalculatorPage
      href={HREF}
      eyebrow="Debt snowball"
      title="Debt Snowball Calculator"
      intro="List your debts, add what you can pay on top of the minimums, and see exactly when each one is gone. We also run the avalanche method on the same numbers so you can compare."
      calculator={<MultiDebt strategy="snowball" />}
      article={
        <>
          <h2>How the debt snowball works</h2>
          <p>
            With the debt snowball, you pay the minimum on every debt and put every extra dollar toward the <strong>smallest balance</strong> first.
            When that debt is gone, its minimum payment rolls into the next smallest balance. The payment you throw at each debt keeps
            growing, like a snowball rolling downhill.
          </p>
          <h2>Why people choose it</h2>
          <p>
            The snowball usually costs a little more interest than the avalanche method, because it ignores interest rates. What it gives
            you instead is speed on the first win: a small balance can disappear in a few months, and seeing an account hit zero is a
            strong reason to keep going. For many people, sticking with a plan matters more than squeezing out every dollar of interest.
          </p>
          <h2>How to use this calculator</h2>
          <ol>
            <li>Enter each debt with its current balance, APR and minimum payment.</li>
            <li>Add the extra amount you can pay every month on top of all minimums.</li>
            <li>Read your debt-free date, total interest and the order your debts get paid off.</li>
            <li>Check the comparison box to see how the avalanche method would do with the same budget.</li>
          </ol>
          <p>
            The calculator keeps your total monthly budget the same the whole time, so freed-up minimums automatically roll into the next
            debt. It assumes no new charges and fixed minimum payments.
          </p>
        </>
      }
      faq={[
        {
          q: "Is the debt snowball or avalanche better?",
          a: "The avalanche method (highest APR first) usually costs less interest. The snowball (smallest balance first) gives faster early wins. If the interest difference is small, the method you will actually stick with is the better one for you.",
        },
        {
          q: "Should I include my mortgage in the debt snowball?",
          a: "Most people leave the mortgage out and focus on credit cards, personal loans, car loans and similar debts first. You can add it here to see the effect, but a mortgage's size usually makes it the last debt either way.",
        },
        {
          q: "What happens when one debt is paid off?",
          a: "Its minimum payment is added to the payment on the next debt in line. Your total monthly budget stays the same, so each debt gets paid faster than the one before.",
        },
        {
          q: "Does this calculator store my data?",
          a: "No. Everything runs in your browser. Nothing you type is sent to our servers.",
        },
      ]}
    />
  );
}
