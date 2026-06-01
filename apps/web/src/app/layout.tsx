import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { POSITIONING } from "@virlux/shared";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIRLUX – Cross-Border B2B Payments for Canadian SMEs",
  description: POSITIONING.tagline,
  openGraph: {
    title: "VIRLUX – Cross-Border B2B Payments for Canadian SMEs",
    description: POSITIONING.tagline,
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
