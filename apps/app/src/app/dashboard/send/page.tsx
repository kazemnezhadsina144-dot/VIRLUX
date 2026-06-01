"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SUPPORTED_COUNTRIES, PRICING, formatSmeTxStatus } from "@virlux/shared";
import { trackEvent } from "@/lib/analytics";

type Quote = {
  quoteId: string;
  amountOut: number;
  virluxFeeAmount: number;
  estimatedGasUsd: number;
  disclaimer: string;
};

const DEFAULT_COIN = "USDC" as const;
const DEFAULT_NETWORK = "polygon" as const;

const CORRIDOR_COUNTRY: Record<"PH" | "US", string> = {
  PH: "PH",
  US: "US",
};

export default function SendPage() {
  const me = useAuth();
  const locked = me?.organization?.pilotCorridor ?? null;
  const [amount, setAmount] = useState("500");
  const [from, setFrom] = useState<"CAD" | "USD">("CAD");
  const [country, setCountry] = useState("PH");
  const [recipientName, setRecipientName] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [memo, setMemo] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [approvalThreshold, setApprovalThreshold] = useState(5000);

  const countries = useMemo(() => {
    if (!locked) return SUPPORTED_COUNTRIES;
    const code = CORRIDOR_COUNTRY[locked];
    return SUPPORTED_COUNTRIES.filter((c) => c.code === code);
  }, [locked]);

  useEffect(() => {
    if (locked) setCountry(CORRIDOR_COUNTRY[locked]);
  }, [locked]);

  useEffect(() => {
    api<{ demoApprovalThresholdCad?: number; approvalThresholdCad?: number }>("/api/meta")
      .then((m) => setApprovalThreshold(m.demoApprovalThresholdCad ?? m.approvalThresholdCad ?? 5000))
      .catch(() => {});
  }, []);

  async function getQuote() {
    setLoading(true);
    setMsg("");
    try {
      const q = await api<Quote>("/api/quote", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromCurrency: from,
          toStablecoin: DEFAULT_COIN,
          network: DEFAULT_NETWORK,
        }),
      });
      setQuote(q);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Could not get rate");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!quote?.quoteId) {
      setMsgType("error");
      setMsg("Confirm your rate first");
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
      setMsgType("success");
      setMsg(`Payment sent — status: ${formatSmeTxStatus(tx.status)}`);
      trackEvent("first_send");
      setQuote(null);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  const corridorLabel = locked === "PH" ? "Philippines" : locked === "US" ? "United States" : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white">Send payment</h1>
      <p className="mt-1 text-sm text-slate-400">
        Pay international suppliers in one step — {PRICING.flatFeePercent}% flat fee, confirmed upfront.
      </p>

      {corridorLabel && (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
          Your pilot is limited to payments to <strong className="text-white">{corridorLabel}</strong>.
        </div>
      )}

      <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
        Payments over ${approvalThreshold.toLocaleString()} CAD require an approver on your team before processing.
      </div>

      <div className="mt-6 space-y-4 glass-panel p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-400">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field mt-1"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Currency</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as "CAD" | "USD")}
              className="input-field mt-1"
            >
              <option>CAD</option>
              <option>USD</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">Recipient country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input-field mt-1"
            disabled={Boolean(locked)}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder="Recipient name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="input-field text-sm"
        />
        <input
          placeholder="Payment reference / invoice # (optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="input-field text-sm"
        />
        <details className="text-sm text-slate-500">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-300">Recipient payout details (if required)</summary>
          <input
            placeholder="Bank or payout reference"
            value={recipientWallet}
            onChange={(e) => setRecipientWallet(e.target.value)}
            className="input-field mt-3 text-sm font-mono"
          />
        </details>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={getQuote} disabled={loading} className="btn-ghost !py-2 text-sm">
            Confirm rate
          </button>
          <button type="button" onClick={send} disabled={loading || !quote} className="btn-primary !py-2 text-sm">
            Send payment
          </button>
        </div>

        {quote && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm">
            <p className="text-slate-300">
              VIRLUX fee ({PRICING.flatFeePercent}%): {quote.virluxFeeAmount} {from}
            </p>
            <p className="mt-2 text-lg font-medium text-white">
              Recipient receives ≈ {quote.amountOut} (estimated)
            </p>
            <p className="mt-2 text-xs text-slate-500">{quote.disclaimer}</p>
          </div>
        )}
        {msg && (
          <p className={`text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
        )}
      </div>
    </div>
  );
}
