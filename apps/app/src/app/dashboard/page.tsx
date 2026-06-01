"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { GettingStartedChecklist } from "@/components/GettingStartedChecklist";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Tx = {
  id: string;
  amountCad: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const me = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    api<{ transactions: Tx[] }>("/api/transactions")
      .then((d) => setTxs(d.transactions.slice(0, 5)))
      .catch(() => {});
  }, []);

  const cad = Number(me?.wallet?.cadBalance ?? 0);
  const kyc = me?.kycStatus ?? "pending";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-slate-400">Welcome back{me?.fullName ? `, ${me.fullName}` : ""}</p>

      <GettingStartedChecklist kycStatus={kyc} cadBalance={cad} txCount={txs.length} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">CAD balance</p>
          <p className="mt-2 text-3xl font-bold text-white">${cad.toLocaleString()}</p>
          <Link href="/dashboard/deposits" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">
            Add funds →
          </Link>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Verification</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">{kyc.replace(/_/g, " ")}</p>
          {kyc !== "approved" && (
            <Link href="/dashboard/kyc" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">
              Complete verification →
            </Link>
          )}
        </div>
        <div className="glass-panel p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Quick actions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/send" className="btn-primary text-sm">
              Send payment
            </Link>
            <Link href="/dashboard/transactions" className="btn-secondary text-sm">
              View payments
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent payments</h2>
          <Link href="/dashboard/transactions" className="text-sm text-blue-400">
            View all
          </Link>
        </div>
        {txs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No payments yet. Send your first international payment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
            {txs.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/transactions/${t.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]"
                >
                  <span className="font-medium text-white">${Number(t.amountCad).toLocaleString()} CAD</span>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
