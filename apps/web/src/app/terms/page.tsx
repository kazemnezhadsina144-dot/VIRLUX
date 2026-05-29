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
              VIRLUX provides cross-border B2B payment tools including CAD funding via Interac
              e-Transfer (subject to manual confirmation), FX quotes, team approval workflows, and
              stablecoin settlement where configured. Services may change; material changes will be
              communicated with reasonable notice.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">3. Eligibility & KYC</h2>
            <p className="mt-2">
              You must complete identity and business verification before moving funds. You represent
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
            <h2 className="text-lg font-semibold text-white">5. Fees & FX</h2>
            <p className="mt-2">
              Fees and rates are shown before you confirm a payment. Quotes expire as displayed. Network
              gas estimates are indicative; actual blockchain costs may vary.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">6. Settlement risk</h2>
            <p className="mt-2">
              Stablecoin settlement depends on third-party networks and providers. If settlement fails
              after debit, eligible fiat balances will be refunded per our operational procedures.
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
