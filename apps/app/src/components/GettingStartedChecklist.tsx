"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { isPublicDemoMode } from "@virlux/shared";

const STEPS = [
  { key: "kyc", label: "Verify your business", href: "/dashboard/kyc", check: (kyc: string) => kyc === "approved" },
  { key: "deposit", label: "Add funds via Interac", href: "/dashboard/deposits", check: (_k: string, bal: number) => bal > 0 },
  { key: "send", label: "Send your first payment", href: "/dashboard/send", check: (_k: string, _b: number, txCount: number) => txCount > 0 },
  { key: "track", label: "Track payment status", href: "/dashboard/transactions", check: (_k: string, _b: number, txCount: number) => txCount > 0 },
] as const;

type Props = {
  kycStatus: string;
  cadBalance: number;
  txCount: number;
};

export function GettingStartedChecklist({ kycStatus, cadBalance, txCount }: Props) {
  const me = useAuth();
  const show = isPublicDemoMode() || process.env.NODE_ENV === "development";
  if (!show) return null;

  const doneCount = STEPS.filter((s) => s.check(kycStatus, cadBalance, txCount)).length;
  if (doneCount >= STEPS.length) return null;

  return (
    <section className="mt-8 glass-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Getting started</p>
          <h2 className="mt-1 font-semibold text-white">
            {doneCount} of {STEPS.length} complete
          </h2>
        </div>
        {me?.organization?.name && (
          <span className="text-xs text-slate-500">{me.organization.name}</span>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {STEPS.map((step) => {
          const done = step.check(kycStatus, cadBalance, txCount);
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  done
                    ? "bg-emerald-500/5 text-emerald-300"
                    : "bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
                  }`}
                >
                  {done ? "✓" : "○"}
                </span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
