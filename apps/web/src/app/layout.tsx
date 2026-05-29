import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIRLUX – Cross-Border B2B Payments for Canadian Business",
  description:
    "Canadian SMEs send CAD & USD globally with upfront FX, Interac on-ramp, team approvals, and minute-scale settlement. Built for importers, agencies, and trade.",
  openGraph: {
    title: "VIRLUX – Cross-Border B2B Payments",
    description: "Transparent FX. Interac in. Stablecoin rails out. Built in Canada.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={jakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
