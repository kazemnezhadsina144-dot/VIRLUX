"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, canApprove } from "@/lib/auth-context";
import { parseTransactionsResponse, toDisplayTransaction } from "@/lib/transactions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ApprovalsPage() {
  const me = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReturnType<typeof toDisplayTransaction>[]>([]);

  useEffect(() => {
    if (!canApprove(me?.role)) {
      setLoading(false);
      return;
    }
    api<unknown>("/api/transactions?status=awaiting_approval")
      .then((data) => setItems(parseTransactionsResponse(data).map(toDisplayTransaction)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [me?.role]);

  if (!canApprove(me?.role)) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Approvals</h1>
        <p className="mt-4 text-sm text-slate-400">Your role cannot approve payments.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Approvals</h1>
      <p className="mt-1 text-slate-400">Payments waiting for your review before processing.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No pending approvals" description="Payments over your threshold will appear here." />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/transactions/${t.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left hover:bg-amber-500/10"
              >
                <div>
                  <p className="font-medium text-white">{t.amountLabel}</p>
                  <p className="text-xs text-slate-500">{t.recipientName ?? "International payment"}</p>
                </div>
                <StatusBadge status={t.status} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard/transactions" className="mt-6 inline-block text-sm text-blue-400">
        View all payments →
      </Link>
    </div>
  );
}
