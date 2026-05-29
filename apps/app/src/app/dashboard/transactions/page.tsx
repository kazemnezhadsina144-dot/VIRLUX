"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth, canApprove } from "@/lib/auth-context";

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

export default function TransactionsPage() {
  const me = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const approver = canApprove(me?.role);

  function reload() {
    api<Tx[]>("/api/transactions").then(setTxs);
  }

  useEffect(() => {
    reload();
  }, []);

  async function approve(id: string) {
    await api(`/api/transactions/${id}/approve`, { method: "POST" });
    reload();
  }

  const pending = txs.filter((t) => t.status === "awaiting_approval");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <p className="mt-1 text-sm text-slate-400">Organization-wide payment history and approvals</p>

      {approver && pending.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          {pending.length} payment(s) awaiting your approval
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Out</th>
              <th className="py-2 pr-4">Network</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-800">
                <td className="py-3 pr-4 text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4">
                  {tx.amountIn} {tx.fromCurrency}
                </td>
                <td className="py-3 pr-4">
                  {tx.amountOut} {tx.toStablecoin}
                </td>
                <td className="py-3 pr-4 capitalize">{tx.network}</td>
                <td className="py-3 pr-4">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">{tx.status}</span>
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
                        className="ml-3 text-xs text-green-400 hover:underline"
                      >
                        Approve
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txs.length === 0 && <p className="mt-4 text-slate-500">No transactions yet</p>}
      </div>
    </div>
  );
}
