"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth, canSend } from "@/lib/auth-context";

type Me = {
  fullName: string;
  kycStatus: string;
  organization?: { name: string } | null;
  wallet?: { cadBalance: string; usdBalance: string; usdcBalance: string; address?: string };
};

type Tx = {
  id: string;
  status: string;
  amountIn: string;
  fromCurrency: string;
  amountOut: string;
  toStablecoin: string;
  createdAt: string;
};

function statusBadge(status: string) {
  if (status === "confirmed") return "badge-green";
  if (status === "awaiting_approval") return "badge-amber";
  if (status === "failed") return "badge bg-red-500/15 text-red-400";
  return "badge-slate";
}

export default function OverviewPage() {
  const meAuth = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const canSendMoney = canSend(meAuth?.role);

  useEffect(() => {
    Promise.all([api<Me>("/api/auth/me"), api<Tx[]>("/api/transactions")]).then(([m, t]) => {
      setMe(m);
      setTxs(t.slice(0, 5));
    });
  }, []);

  if (!me) {
    return (
      <div className="flex items-center gap-3 text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        Loading dashboard…
      </div>
    );
  }

  const w = me.wallet;
  const pending = txs.filter((t) => t.status === "awaiting_approval").length;

  return (
    <div className="bg-app-gradient min-h-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Overview</p>
          <h1 className="text-2xl font-bold text-white">Good day, {me.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {me.organization?.name ?? "Your business"} · KYC{" "}
            <span className={me.kycStatus === "approved" ? "text-emerald-400" : "text-amber-400"}>
              {me.kycStatus.replace("_", " ")}
            </span>
          </p>
        </div>
        {canSendMoney && (
          <div className="flex gap-2">
            <Link href="/dashboard/send" className="btn-primary">
              Send payment
            </Link>
            <Link href="/dashboard/deposits" className="btn-ghost">
              Add funds
            </Link>
          </div>
        )}
      </div>

      {pending > 0 && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          {pending} payment(s) awaiting approval —{" "}
          <Link href="/dashboard/transactions" className="font-medium text-amber-100 underline">
            review now
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile label="CAD balance" value={`$${Number(w?.cadBalance ?? 0).toLocaleString()}`} accent="blue" />
        <StatTile label="USD balance" value={`$${Number(w?.usdBalance ?? 0).toLocaleString()}`} accent="slate" />
        <StatTile
          label="USDC balance"
          value={`${Number(w?.usdcBalance ?? 0).toLocaleString()}`}
          suffix="USDC"
          accent="amber"
        />
      </div>

      {w?.address && (
        <p className="mt-4 truncate font-mono text-xs text-slate-600">Treasury wallet · {w.address}</p>
      )}

      <section className="mt-10 glass-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent activity</h2>
          <Link href="/dashboard/transactions" className="text-sm text-blue-400 hover:text-blue-300">
            View all →
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {txs.length === 0 && (
            <li className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-slate-500">
              No transactions yet.{" "}
              {canSendMoney && (
                <Link href="/dashboard/send" className="text-blue-400 hover:underline">
                  Send your first payment
                </Link>
              )}
            </li>
          )}
          {txs.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-black/20 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-white">
                  {tx.amountIn} {tx.fromCurrency} → {tx.amountOut} {tx.toStablecoin}
                </p>
                <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <span className={statusBadge(tx.status)}>{tx.status.replace("_", " ")}</span>
            </li>
          ))}
        </ul>
      </section>

      {me.kycStatus !== "approved" && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="font-medium text-amber-200">Complete verification to send and deposit</p>
          <p className="mt-1 text-sm text-amber-200/70">Canadian compliance requires business KYC before moving funds.</p>
          <Link href="/dashboard/kyc" className="btn-primary mt-4 inline-flex">
            Complete KYC →
          </Link>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent: "blue" | "amber" | "slate";
}) {
  const glow =
    accent === "blue" ? "from-blue-600/10" : accent === "amber" ? "from-amber-500/10" : "from-slate-500/5";
  return (
    <div className={`stat-tile bg-gradient-to-br ${glow} to-transparent`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-slate-400">{suffix}</span>}
      </p>
    </div>
  );
}
