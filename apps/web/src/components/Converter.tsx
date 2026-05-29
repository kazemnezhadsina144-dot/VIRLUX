"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING } from "@virlux/shared";
import { fetchQuote } from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

type Network = "ethereum" | "polygon" | "solana";

type QuoteResult = {
  virluxFeeAmount: number;
  estimatedGasUsd: number;
  amountOut: number;
  midMarketRate?: number;
  disclaimer: string;
  indicative?: boolean;
};

export function Converter() {
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState<"CAD" | "USD">("CAD");
  const [coin, setCoin] = useState<"USDC" | "USDT">("USDC");
  const [network, setNetwork] = useState<Network>("polygon");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bankSpreadEstimate = (parseFloat(amount) || 0) * 0.025;

  async function getQuote() {
    setLoading(true);
    setError("");
    try {
      const q = await fetchQuote({
        amount: parseFloat(amount) || 0,
        fromCurrency: from,
        toStablecoin: coin,
        network,
      });
      setQuote(q);
    } catch {
      setError("Rate feed unavailable. Start the API or try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="calculator" className="glass-card relative overflow-hidden p-6 shadow-card lg:p-8">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">Live rate calculator</p>
            <h3 className="mt-1 text-xl font-bold text-white">See what you save vs your bank</h3>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Mid-market FX
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">You send</span>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg font-semibold text-white outline-none ring-blue-500/0 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value as "CAD" | "USD")}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 font-medium text-white outline-none"
              >
                <option>CAD</option>
                <option>USD</option>
              </select>
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Receive as</span>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value as "USDC" | "USDT")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option>USDC</option>
                <option>USDT</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Network</span>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as Network)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="polygon">Polygon · low gas</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={getQuote}
            disabled={loading}
            className="btn-primary w-full !py-3.5"
          >
            {loading ? "Fetching live rates…" : "Calculate savings"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {quote && (
          <div className="mt-6 space-y-4 rounded-xl border border-white/[0.08] bg-black/25 p-5">
            <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-xs text-slate-500">Recipient receives</p>
                <p className="text-3xl font-bold text-white">
                  {quote.amountOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  <span className="text-lg text-amber-400">{coin}</span>
                </p>
              </div>
              {quote.midMarketRate != null && (
                <p className="text-right text-xs text-slate-500">
                  Rate<br />
                  <span className="font-mono text-slate-300">{quote.midMarketRate.toFixed(4)}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">VIRLUX fee ({PRICING.flatFeePercent}%)</p>
                <p className="font-semibold text-white">{from} {quote.virluxFeeAmount.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Est. network gas</p>
                <p className="font-semibold text-white">${quote.estimatedGasUsd.toFixed(2)} USD</p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
              <p className="font-medium text-emerald-400">
                Est. savings vs typical bank wire (~2.5% hidden FX)
              </p>
              <p className="mt-1 text-emerald-200/80">
                Up to ~{from} {bankSpreadEstimate.toFixed(0)} kept in your business on this transfer*
              </p>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">{quote.disclaimer}</p>
            <Link href={APP_URL} className="btn-primary w-full text-center">
              Open account to send →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
