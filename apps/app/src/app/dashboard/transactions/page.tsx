"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { parseTransactionsResponse, toDisplayTransaction } from "@/lib/transactions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TransactionsPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<ReturnType<typeof toDisplayTransaction>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<unknown>("/api/transactions")
      .then((data) => setTxs(parseTransactionsResponse(data).map(toDisplayTransaction)))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, []);

  function open(id: string) {
    router.push(`/dashboard/transactions/${id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Payments</h1>
      <p className="mt-1 text-slate-400">Track status and history for every international payment.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No payments yet"
            description="Send your first international payment from the Send page."
            actionLabel="Send payment"
            actionHref="/dashboard/send"
          />
        </div>
      ) : (
        <>
          <div className="mt-8 hidden overflow-x-auto rounded-xl border border-white/[0.06] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => open(t.id)}
                    className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-white">{t.amountLabel}</td>
                    <td className="px-4 py-3 text-slate-400">{t.recipientName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3 md:hidden">
            {txs.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => open(t.id)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{t.amountLabel}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
