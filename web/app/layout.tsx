import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: Free Debt Payoff Calculators`, template: `%s | ${SITE_NAME}` },
  description:
    "Free debt snowball, debt avalanche and credit card payoff calculators. See your debt-free date and how much interest you could save.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

const ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {ADSENSE && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}`} crossOrigin="anonymous" />
        )}
      </head>
      <body className="min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
