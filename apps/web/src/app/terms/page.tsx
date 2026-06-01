import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COMPANY } from "@virlux/shared";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-virlux-bg">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to home
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">
          Effective April 2026 · {COMPANY.legalName} · Draft for counsel review
        </p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-400">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Agreement</h2>
            <p className="mt-2">
              By using VIRLUX services, you agree to these Terms on behalf of your business. If you do
              not agree, do not use the platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">2. Services</h2>
            <p className="mt-2">
              VIRLUX provides cross-border business payment services including CAD funding via Interac
              e-Transfer, exchange rate quotes, team approval workflows, and international payment
              delivery through licensed financial partners. Services may change; material changes will be
              communicated with reasonable notice.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">3. Eligibility & verification</h2>
            <p className="mt-2">
              You must complete business and identity verification before sending payments. You represent
              that information provided is accurate and you are authorized to act for your organization.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">4. Interac deposits</h2>
            <p className="mt-2">
              You must include the exact reference code shown in the dashboard when sending Interac
              e-Transfers. Funds remain pending until VIRLUX confirms receipt. VIRLUX is not
              responsible for misdirected transfers without the correct reference or amount.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">5. Fees & exchange rates</h2>
            <p className="mt-2">
              Fees and rates are shown before you confirm a payment. Quotes expire as displayed. Final
              recipient amounts may vary slightly based on partner processing and destination.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">6. Payment delivery</h2>
            <p className="mt-2">
              International payments are processed through regulated partners and banking networks.
              Delivery times vary by destination. If a payment cannot be completed after your account is
              debited, eligible balances will be restored according to our operational procedures.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">7. Prohibited use</h2>
            <p className="mt-2">
              No use for sanctions evasion, fraud, money laundering, or unlawful activity. VIRLUX may
              suspend accounts pending review.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">8. Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, VIRLUX is not liable for indirect or consequential
              damages. Direct liability is limited to fees paid in the twelve months preceding a claim,
              except where prohibited by law.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">9. Governing law</h2>
            <p className="mt-2">
              These Terms are governed by the laws of Ontario and the federal laws of Canada applicable
              therein.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">10. Contact</h2>
            <p className="mt-2">
              {COMPANY.legalName} · {COMPANY.address} ·{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-blue-400">
                {COMPANY.email}
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
