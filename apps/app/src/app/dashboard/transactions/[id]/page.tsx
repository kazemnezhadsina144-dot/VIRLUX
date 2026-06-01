"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth, canApprove } from "@/lib/auth-context";
import { formatSmeTxStatus } from "@virlux/shared";

type Tx = {
  id: string;
  userId: string;
  status: string;
  needsApproval?: boolean;
  amountIn: string;
  fromCurrency: string;
  amountOut: string;
  toStablecoin: string;
  network: string;
  midMarketRate: string;
  feeAmount: string;
  gasEstimateUsd: string;
  recipientCountry?: string;
  recipientName?: string;
  recipientWallet?: string;
  memo?: string;
  txHash?: string;
  partnerSettlementId?: string;
  submittedToPartnerAt?: string;
  failureReason?: string;
  settledAt?: string;
  createdAt: string;
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const me = useAuth();
  const [tx, setTx] = useState<Tx | null>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [rejectReason, setRejectReason] = useState("Does not meet approval policy");

  const approver = canApprove(me?.role);
  const isOwner = tx?.userId === me?.id;
  const canActAsApprover =
    approver && tx?.status === "awaiting_approval" && tx.needsApproval && !isOwner;
  const canCancel = isOwner && tx?.status === "awaiting_approval";

  function load() {
    if (id) api<Tx>(`/api/transactions/${id}`).then(setTx);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function approve() {
    setMsg("");
    try {
      await api(`/api/transactions/${id}/approve`, { method: "POST" });
      setMsgType("success");
      setMsg("Payment approved.");
      load();
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function reject() {
    setMsg("");
    try {
      await api(`/api/transactions/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setMsgType("success");
      setMsg("Payment rejected. Funds refunded.");
      load();
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function cancel() {
    setMsg("");
    try {
      await api(`/api/transactions/${id}/cancel`, { method: "POST" });
      setMsgType("success");
      setMsg("Payment cancelled. Funds refunded.");
      load();
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!tx) return <p className="text-slate-400">Loading…</p>;

  function statusLabel(status: string) {
    return formatSmeTxStatus(status);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/transactions" className="text-sm text-blue-400 hover:text-blue-300">
        ← Back to transactions
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Payment {tx.id.slice(0, 8)}…</h1>
      <p className="mt-1 text-sm text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>

      {(canActAsApprover || canCancel) && (
        <div className="mt-6 glass-panel p-4">
          <p className="text-sm font-medium text-amber-200">Action required</p>
          {canActAsApprover && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={approve} className="btn-primary !py-2 text-sm">
                Approve payment
              </button>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field !py-2 text-sm flex-1 min-w-[200px]"
                placeholder="Rejection reason"
              />
              <button
                type="button"
                onClick={reject}
                className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Reject
              </button>
            </div>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              className="mt-3 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel my payment
            </button>
          )}
        </div>
      )}

      {msg && <p className={`mt-4 text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}

      <dl className="mt-8 space-y-4 glass-panel p-6 text-sm">
        <Row label="Status" value={statusLabel(tx.status)} />
        <Row label="Send" value={`${tx.amountIn} ${tx.fromCurrency}`} />
        <Row label="Recipient receives" value={`≈ ${tx.amountOut}`} />
        <Row label="Exchange rate" value={tx.midMarketRate} />
        <Row label="Service fee" value={tx.feeAmount} />
        {tx.recipientCountry && <Row label="Country" value={tx.recipientCountry} />}
        {tx.recipientName && <Row label="Recipient" value={tx.recipientName} />}
        {tx.memo && <Row label="Reference" value={tx.memo} />}
        {(tx.recipientWallet || tx.txHash) && (
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer text-slate-400">Payment reference details</summary>
            {tx.recipientWallet && <Row label="Payout details" value={tx.recipientWallet} mono />}
            {tx.txHash && <Row label="Confirmation ID" value={tx.txHash} mono />}
          </details>
        )}
        {tx.settledAt && <Row label="Settled" value={new Date(tx.settledAt).toLocaleString()} />}
        {tx.failureReason && <Row label="Failure" value={tx.failureReason} />}
      </dl>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`text-right text-white ${mono ? "font-mono text-xs break-all max-w-[60%]" : ""}`}>{value}</dd>
    </div>
  );
}
