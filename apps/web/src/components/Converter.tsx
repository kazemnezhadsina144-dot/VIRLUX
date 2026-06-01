"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING } from "@virlux/shared";
import { fetchQuote } from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

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
        toStablecoin: "USDC",
        network: "polygon",
      });
      setQuote(q);
    } catch {
      setError("Rate unavailable right now. Please try again in a moment.");
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
            <p className="section-label">Rate calculator</p>
            <h3 className="mt-1 text-xl font-bold text-white">See your cost before you send</h3>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Live rates
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment amount</span>
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

          <button
            type="button"
            onClick={getQuote}
            disabled={loading}
            className="btn-primary w-full !py-3.5"
          >
            {loading ? "Calculating…" : "Get quote"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {quote && (
          <div className="mt-6 space-y-4 rounded-xl border border-white/[0.08] bg-black/25 p-5">
            <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-xs text-slate-500">Recipient receives (est.)</p>
                <p className="text-3xl font-bold text-white">
                  {quote.amountOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              {quote.midMarketRate != null && (
                <p className="text-right text-xs text-slate-500">
                  Exchange rate
                  <br />
                  <span className="font-mono text-slate-300">{quote.midMarketRate.toFixed(4)}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">VIRLUX fee ({PRICING.flatFeePercent}%)</p>
                <p className="font-semibold text-white">
                  {from} {quote.virluxFeeAmount.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Processing (est.)</p>
                <p className="font-semibold text-white">${quote.estimatedGasUsd.toFixed(2)} USD</p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
              <p className="font-medium text-emerald-400">Estimated savings vs typical bank wire</p>
              <p className="mt-1 text-emerald-200/80">
                Up to ~{from} {bankSpreadEstimate.toFixed(0)} retained on this payment*
              </p>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">{quote.disclaimer}</p>
            <Link href={APP_URL} className="btn-primary w-full text-center">
              Create free account →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
