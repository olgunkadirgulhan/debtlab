import type { Metadata } from "next";
import CalculatorPage from "@/components/CalculatorPage";
import CreditCardPayoff from "@/components/CreditCardPayoff";

const HREF = "/calculators/credit-card-payoff/";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator: How Long Will It Take?",
  description:
    "Free credit card payoff calculator. Enter your balance, APR and monthly payment to see how long payoff takes, total interest, and how much paying a little more could save.",
  alternates: { canonical: HREF },
};

export default function Page() {
  return (
    <CalculatorPage
      href={HREF}
      eyebrow="Credit card payoff"
      title="Credit Card Payoff Calculator"
      intro="See how long it takes to pay off a credit card with a fixed monthly payment, what it costs in interest, and how much faster a slightly bigger payment gets you there."
      calculator={<CreditCardPayoff />}
      article={
        <>
          <h2>How credit card interest adds up</h2>
          <p>
            Card issuers charge interest every month on the balance you carry. A 24% APR works out to about 2% a month, so a $5,000
            balance adds roughly $100 of interest before your payment even touches the principal. That is why small payments can feel
            like they barely move the balance.
          </p>
          <h2>Why a fixed payment beats the minimum</h2>
          <p>
            Minimum payments usually shrink as your balance shrinks, which stretches payoff out for years. Picking a fixed amount and
            paying it every month, even after the minimum drops, means more of each payment goes to principal over time. The table under
            the chart shows what an extra $50, $100 or $200 a month could change for your numbers.
          </p>
          <h2>Ways to lower the cost</h2>
          <ul>
            <li>Pay more than the minimum, and pay it every month.</li>
            <li>Ask your issuer for a lower APR. A good payment history helps.</li>
            <li>Compare a balance transfer offer, including its fee and what the rate becomes after the promo period.</li>
            <li>Stop new charges on the card while you pay it down.</li>
          </ul>
        </>
      }
      faq={[
        {
          q: "How is credit card interest calculated?",
          a: "Most cards use a daily periodic rate (APR divided by 365) applied to your average daily balance. This calculator uses a monthly rate (APR divided by 12), which gives a very close estimate for planning.",
        },
        {
          q: "What if my payment is less than the monthly interest?",
          a: "The balance will never go down. The calculator warns you and shows the smallest payment that starts to reduce the balance.",
        },
        {
          q: "Does paying twice a month help?",
          a: "It can slightly reduce interest because your average daily balance is lower. The bigger win is the total amount you pay each month.",
        },
        {
          q: "Will paying off my card raise my credit score?",
          a: "Lower balances reduce your credit utilization, which is a major scoring factor, so scores often improve as balances fall. Results vary by person and scoring model.",
        },
      ]}
    />
  );
}
