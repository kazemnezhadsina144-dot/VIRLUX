import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Converter } from "@/components/Converter";
import { BookDemoLink } from "@/components/BookDemoLink";
import { ProductPreview } from "@/components/ProductPreview";
import {
  COVERAGE,
  PRICING,
  USE_CASES,
  FAQ_ITEMS,
  COMPANY,
  SETTLEMENT,
  SUPPORTED_COUNTRIES,
  POSITIONING,
  PUBLIC_COPY,
} from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const STATS = [
  { value: "< 15 min", label: "Typical delivery", sub: "After approval" },
  { value: `${PRICING.flatFeePercent}%`, label: "Flat transparent fee", sub: "No hidden FX spread" },
  { value: `${COVERAGE.supportedCountries}+`, label: "Business destinations", sub: "Growing every month" },
  { value: "Interac", label: "CAD funding", sub: "Built for Canadian teams" },
];

const TRUST = [...PUBLIC_COPY.trustChips];

const HOW_IT_WORKS = PUBLIC_COPY.howItWorks;

const COMPARE = [
  { feature: "FX transparency", bank: "Hidden spread (2–5%)", virlux: "Mid-market + 1% flat" },
  { feature: "Delivery time", bank: `${SETTLEMENT.bankWireDays} business days`, virlux: "Minutes (after approval)" },
  { feature: "Interac funding", bank: "Not available", virlux: "Native CAD deposits" },
  { feature: "Team approvals", bank: "Manual email chains", virlux: "Built-in workflows" },
  { feature: "Payment records", bank: "Fragmented", virlux: "Full history in one place" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-virlux-bg">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient bg-grid-pattern bg-grid">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Canadian B2B payments · 2026
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {POSITIONING.headline}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                {POSITIONING.description} Delivery in minutes after approval — not{" "}
                {SETTLEMENT.bankWireDays} bank-wire days.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={APP_URL} className="btn-primary">
                  {PUBLIC_COPY.ctaPrimary}
                </Link>
                <BookDemoLink className="btn-secondary" />
                <a href="#calculator" className="btn-secondary hidden sm:inline-flex">
                  Calculate your rate
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                {TRUST.slice(0, 4).map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-fade-up lg:animate-float" style={{ animationDelay: "0.15s" }}>
              <Converter />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] bg-virlux-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/[0.06] md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center md:py-10">
              <p className="text-2xl font-bold text-white md:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-300">{s.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product */}
      <section id="product" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-label text-center">Why finance teams switch</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold text-white">
            Everything your controller needs — nothing your bank forgot to build
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Fund in CAD via Interac",
                desc: "Add funds from any Canadian bank with a clear reference code your AP team can follow.",
                icon: "🏦",
              },
              {
                title: "Rates and fees upfront",
                desc: "See the exchange rate and 1% fee before you confirm. No surprise spreads after the fact.",
                icon: "📊",
              },
              {
                title: "Controls for growing teams",
                desc: "Senders, approvers, and viewers — with a full payment history as you scale.",
                icon: "🛡️",
              },
            ].map((card) => (
              <div key={card.title} className="stat-card group transition hover:border-blue-500/20">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
            <ProductPreview />
            <div>
              <p className="section-label">Dashboard</p>
              <h3 className="mt-2 text-2xl font-bold text-white">One place for your finance team</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Balances, approvals, and payment history — built for controllers who need clarity, not
                another banking portal.
              </p>
              <Link href={APP_URL} className="btn-primary mt-6 inline-flex">
                Open dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section id="how" className="border-t border-white/[0.06] bg-virlux-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-label text-center">How it works</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">Four steps to pay internationally</h2>

          <div className="relative mt-14 grid gap-8 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent md:block" />
            {[
              { n: HOW_IT_WORKS[0].step, title: HOW_IT_WORKS[0].title, desc: HOW_IT_WORKS[0].desc },
              { n: HOW_IT_WORKS[1].step, title: HOW_IT_WORKS[1].title, desc: HOW_IT_WORKS[1].desc },
              { n: HOW_IT_WORKS[2].step, title: HOW_IT_WORKS[2].title, desc: HOW_IT_WORKS[2].desc },
              { n: HOW_IT_WORKS[3].step, title: HOW_IT_WORKS[3].title, desc: HOW_IT_WORKS[3].desc },
            ].map((step) => (
              <div key={step.n} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/10 text-lg font-bold text-blue-400">
                  {step.n}
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">Use cases</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Built for how Canadian business actually trades</h2>
            </div>
            <Link href={APP_URL} className="btn-secondary shrink-0">
              See it in the dashboard →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {USE_CASES.map((u) => (
              <div
                key={u.id}
                className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition hover:border-blue-500/20"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300">{u.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-white/[0.06] bg-virlux-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-label text-center">Compare</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">VIRLUX vs traditional bank wires</h2>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-6 py-4 font-medium text-slate-400">Capability</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Typical bank wire</th>
                  <th className="px-6 py-4 font-medium text-blue-400">VIRLUX</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.feature} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-6 py-4 font-medium text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-slate-500">{row.bank}</td>
                    <td className="px-6 py-4 text-slate-200">{row.virlux}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Corridors */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="section-label text-center">Destinations</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Pay suppliers in key markets</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {SUPPORTED_COUNTRIES.map((c) => (
              <span
                key={c.code}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/[0.06] bg-virlux-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Straightforward pricing</h2>
            <p className="mt-4 text-slate-400">No setup fees. No monthly minimums. You pay when you send.</p>
          </div>

          <div className="mx-auto mt-12 max-w-lg">
            <div className="glass-card border-blue-500/20 p-8 text-center shadow-glow">
              <p className="text-5xl font-bold text-white">
                {PRICING.flatFeePercent}%
                <span className="text-lg font-normal text-slate-400"> flat</span>
              </p>
              <p className="mt-2 text-slate-400">per international payment · all-in rate shown before you confirm</p>
              <ul className="mt-8 space-y-3 text-left text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> Live exchange rates</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> Interac CAD deposits</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> Unlimited team members</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> Approval workflows & payment history</li>
              </ul>
              <Link href={APP_URL} className="btn-primary mt-8 w-full">
                Create free business account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label text-center">Trust & security</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Built for how Canadian finance teams work</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {POSITIONING.complianceLine} This page is not legal or financial advice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {TRUST.map((t) => (
              <span key={t} className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs text-slate-400">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Design partners */}
      <section className="border-t border-white/[0.06] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-label">Design partners</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Seeking 3 Canadian design partners</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            We&apos;re working with early finance teams who pay international suppliers. 90-day pilot — 1% fee,
            $50K CAD/month cap, one corridor. Honest pre-traction; your feedback shapes the product.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <BookDemoLink className="btn-primary" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/[0.06] bg-virlux-surface py-20">
        <div className="mx-auto max-w-2xl px-6">
          <p className="section-label text-center">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">Questions from finance leaders</h2>
          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="faq-item group rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <summary className="flex items-center justify-between px-5 py-4 font-medium text-white">
                  {item.q}
                  <span className="text-slate-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-white/[0.04] px-5 pb-4 pt-2 text-sm leading-relaxed text-slate-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-virlux-card to-virlux-bg p-10 text-center md:p-14">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <h2 className="relative text-3xl font-bold text-white">Ready to simplify international payments?</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-slate-300">
              Join Canadian businesses replacing slow wires with transparent pricing, team approvals, and fast delivery.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link href={APP_URL} className="btn-primary">
                Open dashboard — free
              </Link>
              <BookDemoLink />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
