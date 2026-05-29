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
        <p className="mt-2 text-sm text-slate-500">Effective April 2026 · virlux.com</p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-slate-400">
          <p>
            This policy describes how {COMPANY.legalName} (&quot;VIRLUX&quot;) collects, uses, and
            protects personal information for visitors and business customers in Canada.
          </p>
          <section>
            <h2 className="text-lg font-semibold text-white">Information we collect</h2>
            <p className="mt-2">
              Account registration, KYC/KYB documentation, transaction records, device and log data,
              and communications you send to our team.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="mt-2">
              {COMPANY.legalName}
              <br />
              {COMPANY.address}
              <br />
              <a href={`mailto:${COMPANY.email}`} className="text-blue-400">{COMPANY.email}</a>
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
