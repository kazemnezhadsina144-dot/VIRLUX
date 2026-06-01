import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookDemoLink } from "@/components/BookDemoLink";
import { PRICING, COVERAGE, PUBLIC_COPY } from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-virlux-bg">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to home
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-white">Pricing</h1>
        <p className="mt-2 text-slate-400">Simple, transparent pricing for Canadian B2B cross-border payments.</p>

        <div className="mt-12 glass-panel p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400">Standard</p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{PRICING.flatFeePercent}%</span>
            <span className="text-slate-400">per payment</span>
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li>✓ Interac e-Transfer CAD deposits</li>
            <li>✓ Exchange rate and fee shown before you send</li>
            <li>✓ Team roles and payment approvals</li>
            <li>✓ {COVERAGE.supportedCountries}+ business destinations</li>
            <li>✓ Complete payment history</li>
          </ul>
          <Link href={APP_URL} className="btn-primary mt-8 inline-block">
            Open dashboard
          </Link>
          <div className="mt-4">
            <BookDemoLink className="text-sm text-blue-400 hover:text-blue-300" />
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-white/[0.06] p-6 text-sm text-slate-400">
          <p className="font-medium text-white">Pilot program</p>
            <p className="mt-2">
              Design partners in our pilot program may receive introductory pricing for a limited period. See{" "}
            <Link href="/terms" className="text-blue-400">
              Terms
            </Link>{" "}
            or {PUBLIC_COPY.ctaDemo.toLowerCase()} below.
            </p>
          <div className="mt-4">
            <BookDemoLink className="btn-secondary !py-2 text-sm" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
