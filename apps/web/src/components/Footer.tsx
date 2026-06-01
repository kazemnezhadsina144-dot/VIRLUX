import Link from "next/link";
import { COMPANY } from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function homeSection(hash: string) {
  return `/${hash}`;
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-virlux-surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">
                V
              </span>
              <span className="text-lg font-bold">VIRLUX</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              International business payments for Canadian companies. Transparent rates, Interac funding,
              team approvals, and complete payment records.
            </p>
            <p className="mt-4 text-xs text-slate-500">Built for Canadian SMEs · {COMPANY.address}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href={homeSection("#product")} className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              <li><Link href={APP_URL} className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href="/terms" className="hover:text-white">Terms of service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a>
              </li>
              {COMPANY.phone ? <li>{COMPANY.phone}</li> : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.06] pt-8 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
          <p>Not financial or legal advice. Built for Canadian business payments.</p>
        </div>
      </div>
    </footer>
  );
}
