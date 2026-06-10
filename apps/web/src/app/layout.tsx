import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { POSITIONING, metaDescription } from "@virlux/shared";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  title: "VIRLUX – Cross-Border B2B Payments for Canadian SMEs",
  description: metaDescription(),
  metadataBase: new URL(WEB_URL),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "VIRLUX – Cross-Border B2B Payments for Canadian SMEs",
    description: metaDescription(),
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "VIRLUX" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={jakarta.variable}>
      <body className="font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
