"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  SUPPORTED_COUNTRIES,
  PRICING,
  CLIENT_COPY,
  formatClientCopy,
  formatSmeTxStatus,
} from "@virlux/shared";
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

const LOCKED_COUNTRY: Record<"PH" | "US", string> = {
  PH: "PH",
  US: "US",
};

const COUNTRY_NAMES: Record<"PH" | "US", string> = {
  PH: "Philippines",
  US: "United States",
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
  const [loadingAction, setLoadingAction] = useState<"quote" | "send" | null>(null);
  const [approvalThreshold, setApprovalThreshold] = useState(5000);

  const countries = useMemo(() => {
    if (!locked) return SUPPORTED_COUNTRIES;
    const code = LOCKED_COUNTRY[locked];
    return SUPPORTED_COUNTRIES.filter((c) => c.code === code);
  }, [locked]);

  useEffect(() => {
    if (locked) setCountry(LOCKED_COUNTRY[locked]);
  }, [locked]);

  useEffect(() => {
    api<{ demoApprovalThresholdCad?: number; approvalThresholdCad?: number }>("/api/meta")
      .then((m) => setApprovalThreshold(m.demoApprovalThresholdCad ?? m.approvalThresholdCad ?? 5000))
      .catch(() => {});
  }, []);

  async function getQuote() {
    setLoadingAction("quote");
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
      setLoadingAction(null);
    }
  }

  async function send() {
    if (!quote?.quoteId) {
      setMsgType("error");
      setMsg(CLIENT_COPY.send.confirmRateFirst);
      return;
    }
    setLoadingAction("send");
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
      setMsg(
        formatClientCopy(CLIENT_COPY.send.paymentSent, {
          status: formatSmeTxStatus(tx.status),
        })
      );
      trackEvent("first_send");
      setQuote(null);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoadingAction(null);
    }
  }

  const loading = loadingAction !== null;

  const destinationName =
    locked === "PH" || locked === "US" ? COUNTRY_NAMES[locked] : null;

  return (
    <div className="mx-auto max-w-2xl px-1 sm:px-0">
      <h1 className="text-2xl font-semibold text-white">{CLIENT_COPY.send.title}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {formatClientCopy(CLIENT_COPY.send.subtitle, { fee: PRICING.flatFeePercent })}
      </p>

      {destinationName && (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
          {formatClientCopy(CLIENT_COPY.send.destinationLocked, { country: destinationName })}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
        {formatClientCopy(CLIENT_COPY.send.approvalNotice, {
          amount: approvalThreshold.toLocaleString(),
        })}
      </div>

      <div className="mt-6 space-y-4 glass-panel p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-400">Amount</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Currency</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as "CAD" | "USD")}
              className="input-field mt-1 w-full"
            >
              <option>CAD</option>
              <option>USD</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">{CLIENT_COPY.send.destinationCountry}</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input-field mt-1 w-full"
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
          placeholder={CLIENT_COPY.send.recipientName}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="input-field w-full text-sm"
        />
        <input
          placeholder={CLIENT_COPY.send.paymentReference}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="input-field w-full text-sm"
        />
        <details className="text-sm text-slate-500">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
            {CLIENT_COPY.send.payoutDetailsSummary}
          </summary>
          <input
            placeholder={CLIENT_COPY.send.payoutReferencePlaceholder}
            value={recipientWallet}
            onChange={(e) => setRecipientWallet(e.target.value)}
            className="input-field mt-3 w-full font-mono text-sm"
          />
        </details>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={getQuote} disabled={loading} className="btn-ghost !py-2 text-sm">
            {loadingAction === "quote" ? CLIENT_COPY.sendLoading.confirmingRate : CLIENT_COPY.send.confirmRate}
          </button>
          <button type="button" onClick={send} disabled={loading || !quote} className="btn-primary !py-2 text-sm">
            {loadingAction === "send" ? CLIENT_COPY.sendLoading.sendingPayment : CLIENT_COPY.send.sendPayment}
          </button>
        </div>

        {quote && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm">
            <p className="text-slate-300">
              {formatClientCopy(CLIENT_COPY.send.feeLine, {
                fee: PRICING.flatFeePercent,
                amount: quote.virluxFeeAmount,
                currency: from,
              })}
            </p>
            <p className="mt-2 text-lg font-medium text-white">
              {formatClientCopy(CLIENT_COPY.send.recipientReceives, { amount: quote.amountOut })}
            </p>
            {quote.disclaimer ? (
              <p className="mt-2 text-xs text-slate-500">{quote.disclaimer}</p>
            ) : null}
          </div>
        )}
        {msg && (
          <p className={`text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
        )}
      </div>
    </div>
  );
}
