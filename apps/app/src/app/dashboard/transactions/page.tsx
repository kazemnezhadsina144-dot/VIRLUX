"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth, canApprove } from "@/lib/auth-context";
import { formatSmeTxStatus } from "@virlux/shared";

type Tx = {
  id: string;
  userId: string;
  status: string;
  amountIn: string;
  fromCurrency: string;
  amountOut: string;
  toStablecoin: string;
  network: string;
  recipientCountry?: string;
  txHash?: string;
  needsApproval?: boolean;
  createdAt: string;
};

type Filter = "all" | "awaiting_approval";

export default function TransactionsPage() {
  const me = useAuth();
  const approver = canApprove(me?.role);
  const [filter, setFilter] = useState<Filter>("all");
  const [txs, setTxs] = useState<Tx[]>([]);

  function reload() {
    const q = filter === "awaiting_approval" ? "?status=awaiting_approval" : "";
    api<Tx[]>(`/api/transactions${q}`).then(setTxs);
  }

  useEffect(() => {
    reload();
  }, [filter]);

  async function approve(id: string) {
    await api(`/api/transactions/${id}/approve`, { method: "POST" });
    reload();
  }

  const pendingCount = txs.filter((t) => t.status === "awaiting_approval").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Payments</h1>
      <p className="mt-1 text-sm text-slate-400">History and approvals for your organization</p>

      <div className="mt-4 flex gap-2">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterBtn>
        <FilterBtn active={filter === "awaiting_approval"} onClick={() => setFilter("awaiting_approval")}>
          Pending approval{pendingCount > 0 && filter === "all" ? ` (${pendingCount})` : ""}
        </FilterBtn>
      </div>

      {approver && filter === "awaiting_approval" && txs.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          {txs.length} payment(s) awaiting your approval
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-slate-400">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Recipient gets</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td className="py-3 pr-4 text-white">
                  {tx.amountIn} {tx.fromCurrency}
                </td>
                <td className="py-3 pr-4">
                  ≈ {tx.amountOut}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      tx.status === "confirmed"
                        ? "badge-green"
                        : tx.status === "awaiting_approval"
                          ? "badge-amber"
                          : "badge-slate"
                    }
                  >
                    {formatSmeTxStatus(tx.status)}
                  </span>
                </td>
                <td className="py-3">
                  <Link href={`/dashboard/transactions/${tx.id}`} className="text-blue-400 hover:underline">
                    Details
                  </Link>
                  {approver &&
                    tx.needsApproval &&
                    tx.status === "awaiting_approval" &&
                    tx.userId !== me?.id && (
                      <button
                        type="button"
                        onClick={() => approve(tx.id)}
                        className="ml-3 text-xs text-emerald-400 hover:underline"
                      >
                        Approve
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txs.length === 0 && (
          <p className="mt-4 text-slate-500">
            {filter === "awaiting_approval" ? "No payments awaiting approval." : "No transactions yet."}
          </p>
        )}
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm ${
        active ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30" : "text-slate-400 hover:bg-white/[0.04]"
      }`}
    >
      {children}
    </button>
  );
}
