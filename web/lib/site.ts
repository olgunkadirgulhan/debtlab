import links from "./generated/links.json";
import videos from "./generated/videos.json";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://debtlab.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "DebtLab";
export const SITE_TAGLINE = "Pay off debt faster. See exactly when.";

export const LINKS = links as {
  website: string;
  play_store: string;
  app_store: string;
  affiliate_experian: string;
  youtube_channel: string;
};

export type Video = { id: string; title: string; pillar: string; date: string };
export const VIDEOS = videos as Video[];

export const DISCLAIMER =
  "This tool provides educational estimates only and is not financial advice. Estimated scores are not your actual FICO® or VantageScore®. Not affiliated with Experian, Equifax, or TransUnion.";
export const AFFILIATE_NOTE = "We may earn a commission if you sign up through our links.";

export const CALCULATORS = [
  {
    href: "/calculators/debt-snowball/",
    title: "Debt Snowball Calculator",
    short: "Debt Snowball",
    blurb: "Pay the smallest balance first and see your debt-free date.",
    icon: "snowball",
  },
  {
    href: "/calculators/debt-avalanche/",
    title: "Debt Avalanche Calculator",
    short: "Debt Avalanche",
    blurb: "Pay the highest APR first and compare the interest you save.",
    icon: "avalanche",
  },
  {
    href: "/calculators/credit-card-payoff/",
    title: "Credit Card Payoff Calculator",
    short: "Credit Card Payoff",
    blurb: "One card, one payment: how long it takes and what it costs.",
    icon: "card",
  },
  {
    href: "/calculators/credit-score-simulator/",
    title: "Credit Score Simulator",
    short: "Score Simulator",
    blurb: "Answer 5 questions for an educational score estimate.",
    icon: "gauge",
  },
] as const;
