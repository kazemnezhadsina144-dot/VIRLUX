"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { SUPPORTED_COUNTRIES } from "@virlux/shared";

type Quote = {
  quoteId: string;
  amountOut: number;
  virluxFeeAmount: number;
  estimatedGasUsd: number;
  disclaimer: string;
};

export default function SendPage() {
  const [amount, setAmount] = useState("500");
  const [from, setFrom] = useState<"CAD" | "USD">("CAD");
  const [coin, setCoin] = useState<"USDC" | "USDT">("USDC");
  const [network, setNetwork] = useState<"polygon" | "ethereum" | "solana">("polygon");
  const [country, setCountry] = useState("NG");
  const [recipientName, setRecipientName] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [memo, setMemo] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function getQuote() {
    setLoading(true);
    setMsg("");
    try {
      const q = await api<Quote>("/api/quote", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromCurrency: from,
          toStablecoin: coin,
          network,
        }),
      });
      setQuote(q);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Quote failed");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!quote?.quoteId) {
      setMsg("Get a quote first");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const tx = await api<{ id: string; status: string }>("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          quoteId: quote.quoteId,
          recipientCountry: country,
          recipientName: recipientName || undefined,
          recipientWallet: recipientWallet || undefined,
          memo: memo || undefined,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      setMsg(`Payment submitted — status: ${tx.status}`);
      setQuote(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Send international payment</h1>
      <p className="mt-1 text-sm text-slate-400">Quote first, then confirm. Balances are debited on submit.</p>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-700 bg-[#111827] p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-400">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">From currency</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as "CAD" | "USD")}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            >
              <option>CAD</option>
              <option>USD</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-400">Stablecoin</span>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value as "USDC" | "USDT")}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            >
              <option>USDC</option>
              <option>USDT</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Network</span>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as typeof network)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            >
              <option value="polygon">Polygon</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">Recipient country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder="Recipient name (optional)"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        />
        <input
          placeholder="Recipient wallet address (optional)"
          value={recipientWallet}
          onChange={(e) => setRecipientWallet(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-mono"
        />
        <input
          placeholder="Memo / invoice reference"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={getQuote}
            disabled={loading}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            Get quote
          </button>
          <button
            type="button"
            onClick={send}
            disabled={loading || !quote}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            Confirm & send
          </button>
        </div>

        {quote && (
          <div className="rounded-lg bg-slate-900/80 p-4 text-sm">
            <p>Fee: {quote.virluxFeeAmount} · Gas est.: ${quote.estimatedGasUsd}</p>
            <p className="mt-1 text-lg font-medium text-amber-400">
              Recipient receives: {quote.amountOut} {coin}
            </p>
            <p className="mt-2 text-xs text-slate-500">{quote.disclaimer}</p>
          </div>
        )}
        {msg && <p className="text-sm text-amber-400">{msg}</p>}
      </div>
    </div>
  );
}
