import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COMPANY } from "@virlux/shared";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-virlux-bg">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to home
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">
          Effective April 2026 · PIPEDA-aligned draft · {COMPANY.legalName}
        </p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-400">
          <p>
            {COMPANY.legalName} (&quot;VIRLUX&quot;, &quot;we&quot;) collects and uses personal information in
            accordance with Canada&apos;s Personal Information Protection and Electronic Documents Act
            (PIPEDA) and applicable provincial law.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white">Information we collect</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Account registration: name, email, business name, role</li>
              <li>KYC/KYB: government ID type and number (stored securely), country, review notes</li>
              <li>Transactions: amounts, currencies, corridors, wallet addresses, approval history</li>
              <li>Technical: IP address, device/browser data, audit and security logs</li>
              <li>Communications: support email, Telegram link tokens (when you opt in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Why we collect it</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Provide payment and treasury services</li>
              <li>Verify identity and meet anti-money-laundering obligations</li>
              <li>Fraud prevention, security, and dispute resolution</li>
              <li>Legal and regulatory recordkeeping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookies & sessions</h2>
            <p className="mt-2">
              We use httpOnly cookies for authenticated dashboard sessions. Marketing pages may use
              essential cookies only. We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Subprocessors</h2>
            <p className="mt-2">
              Infrastructure (hosting, database), Circle (stablecoin settlement when enabled), and
              Telegram (optional notifications). A current list is available on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Retention</h2>
            <p className="mt-2">
              Transaction and KYC records are retained for at least five (5) years after account closure
              or last activity, or longer if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your rights</h2>
            <p className="mt-2">
              You may request access, correction, or deletion where permitted by law. Contact us below.
              You may lodge a complaint with the Office of the Privacy Commissioner of Canada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="mt-2">
              Privacy inquiries:{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-blue-400">
                {COMPANY.email}
              </a>
              <br />
              {COMPANY.legalName}
              <br />
              {COMPANY.address}
              <br />
              {COMPANY.phone}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
