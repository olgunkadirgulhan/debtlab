import type { Metadata } from "next";
import CalculatorPage from "@/components/CalculatorPage";
import ScoreSimulator from "@/components/ScoreSimulator";

const HREF = "/calculators/credit-score-simulator/";

export const metadata: Metadata = {
  title: "Credit Score Simulator: Free 5-Question Estimate",
  description:
    "Answer 5 quick questions for an educational credit score estimate from 300 to 850, see your score range and the factor with the biggest room to improve.",
  alternates: { canonical: HREF },
};

export default function Page() {
  return (
    <CalculatorPage
      href={HREF}
      eyebrow="Credit score"
      title="Credit Score Simulator"
      intro="Five questions, one educational estimate. See roughly where your habits put you on the 300 to 850 scale and which factor has the most room to improve."
      calculator={<ScoreSimulator />}
      article={
        <>
          <h2>What goes into a credit score</h2>
          <p>
            FICO describes five categories and their approximate weight for the general population: payment history (35%), amounts owed
            (30%), length of credit history (15%), new credit (10%) and credit mix (10%). This simulator uses those same weights to turn
            your answers into an estimate.
          </p>
          <h2>Score ranges</h2>
          <table>
            <thead>
              <tr>
                <th>Range</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>800 to 850</td><td>Exceptional</td></tr>
              <tr><td>740 to 799</td><td>Very good</td></tr>
              <tr><td>670 to 739</td><td>Good</td></tr>
              <tr><td>580 to 669</td><td>Fair</td></tr>
              <tr><td>300 to 579</td><td>Poor</td></tr>
            </tbody>
          </table>
          <h2>What this estimate can and can&apos;t tell you</h2>
          <p>
            Real scores are calculated from the full data in your credit reports, and different models and bureaus can produce different
            numbers. Use this tool to understand which habits matter most, not to predict a lender&apos;s decision. To see your actual
            score, check with your card issuer, bank, or a credit bureau.
          </p>
        </>
      }
      faq={[
        {
          q: "Is this my real credit score?",
          a: "No. It is an educational estimate based on your answers and the publicly described weight of each factor. It is not a FICO® Score or VantageScore®.",
        },
        {
          q: "What is the fastest way to improve a credit score?",
          a: "Lowering credit card utilization often has the quickest effect because it is based on current balances. Paying before the statement closing date can lower the balance that gets reported.",
        },
        {
          q: "How long do late payments affect a score?",
          a: "Late payments can stay on credit reports for up to seven years, though their impact usually fades over time, especially with a steady record of on-time payments afterward.",
        },
        {
          q: "Does checking my own score lower it?",
          a: "No. Checking your own score is a soft inquiry and does not affect it.",
        },
      ]}
    />
  );
}
