import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COMPANY, CLIENT_COPY } from "@virlux/shared";

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
              <li>Business verification: government ID type and number (stored securely), country</li>
              <li>Payments: amounts, currencies, destinations, approval history</li>
              <li>Technical: IP address, device/browser data, security logs</li>
              <li>Communications: support email, optional Telegram notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Why we collect it</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Provide payment services to your business</li>
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
            <h2 className="text-lg font-semibold text-white">Service providers</h2>
            <p className="mt-2">
              We use trusted providers for hosting, payment processing, and optional notifications.
              A current list is available on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Retention</h2>
            <p className="mt-2">
              Payment and verification records are retained for at least five (5) years after account
              closure or last activity, or longer if required by law.
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
            <h2 className="text-lg font-semibold text-white">Security safeguards</h2>
            <p className="mt-2">
              We apply safeguards proportionate to the sensitivity of financial and identity data,
              including encryption in transit (TLS), hashed credentials, role-based access,
              httpOnly session cookies, rate limiting, audit logging, and restricted database access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Breach notification</h2>
            <p className="mt-2">
              If a breach of security safeguards creates a real risk of significant harm, we will
              notify affected individuals and the Office of the Privacy Commissioner of Canada as
              required by PIPEDA, and document our assessment and response.
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
              {COMPANY.phone ? (
                <>
                  <br />
                  {COMPANY.phone}
                </>
              ) : null}
            </p>
          </section>
          <p className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-slate-500">
            {CLIENT_COPY.legalFooterDisclaimer} Draft for counsel review — not legal advice.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
