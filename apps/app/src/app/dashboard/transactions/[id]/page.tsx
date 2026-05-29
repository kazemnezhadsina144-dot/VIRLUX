"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type Tx = {
  id: string;
  status: string;
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
  failureReason?: string;
  settledAt?: string;
  createdAt: string;
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tx, setTx] = useState<Tx | null>(null);

  useEffect(() => {
    if (id) api<Tx>(`/api/transactions/${id}`).then(setTx);
  }, [id]);

  if (!tx) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/transactions" className="text-sm text-blue-400 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Transaction {tx.id.slice(0, 8)}…</h1>
      <p className="mt-1 text-sm text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>

      <dl className="mt-8 space-y-4 rounded-xl border border-slate-700 bg-[#111827] p-6 text-sm">
        <Row label="Status" value={tx.status} />
        <Row label="Send" value={`${tx.amountIn} ${tx.fromCurrency}`} />
        <Row label="Receive" value={`${tx.amountOut} ${tx.toStablecoin}`} />
        <Row label="Network" value={tx.network} />
        <Row label="Rate" value={tx.midMarketRate} />
        <Row label="VIRLUX fee" value={tx.feeAmount} />
        <Row label="Est. gas" value={`$${tx.gasEstimateUsd}`} />
        {tx.recipientCountry && <Row label="Country" value={tx.recipientCountry} />}
        {tx.recipientName && <Row label="Recipient" value={tx.recipientName} />}
        {tx.recipientWallet && <Row label="Wallet" value={tx.recipientWallet} mono />}
        {tx.memo && <Row label="Memo" value={tx.memo} />}
        {tx.txHash && <Row label="Tx hash" value={tx.txHash} mono />}
        {tx.settledAt && <Row label="Settled" value={new Date(tx.settledAt).toLocaleString()} />}
        {tx.failureReason && <Row label="Failure" value={tx.failureReason} />}
      </dl>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-3 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`text-right ${mono ? "font-mono text-xs break-all max-w-[60%]" : ""}`}>{value}</dd>
    </div>
  );
}
