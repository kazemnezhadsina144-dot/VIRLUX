"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth, canManageTeam } from "@/lib/auth-context";
import { CLIENT_COPY, formatDepositStatus, isPublicDemoMode } from "@virlux/shared";
import { LoadingRows } from "@/components/ui/LoadingRows";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToast } from "@/components/ui/Toast";

type Deposit = {
  id: string;
  reference: string;
  amountCad: string;
  status: string;
  createdAt: string;
  completedAt?: string;
};

type PendingDeposit = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amountCad: string;
  reference: string;
  status: string;
  createdAt: string;
};

export default function DepositsPage() {
  const me = useAuth();
  const toast = useToast();
  const demoMode = isPublicDemoMode() || process.env.NODE_ENV === "development";
  const isAdmin = canManageTeam(me?.role);
  const [amount, setAmount] = useState("1000");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pending, setPending] = useState<PendingDeposit[]>([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [lastRef, setLastRef] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      api<Deposit[]>("/api/wallet/deposits"),
      isAdmin ? api<PendingDeposit[]>("/api/wallet/deposits/pending").catch(() => [] as PendingDeposit[]) : Promise.resolve([]),
    ])
      .then(([d, p]) => {
        setDeposits(d);
        setPending(p);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [isAdmin]);

  async function deposit() {
    setMsg("");
    try {
      const res = await api<{
        paymentIntent: Deposit;
        instructions: { reference: string; message: string };
      }>("/api/wallet/deposit/interac", {
        method: "POST",
        body: JSON.stringify({ amountCad: parseFloat(amount) }),
      });
      setLastRef(res.instructions.reference);
      setMsgType("success");
      setMsg(res.instructions.message);
      setTimeout(load, 1500);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Deposit failed");
    }
  }

  async function confirmDeposit(id: string) {
    await api(`/api/wallet/deposits/${id}/confirm`, { method: "POST" });
    load();
  }

  async function demoFund() {
    setMsg("");
    try {
      await api("/api/demo/fund", { method: "POST", body: JSON.stringify({}) });
      setMsgType("success");
      setMsg("Demo balance added.");
      toast("Demo funds added");
      setTimeout(load, 500);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Demo fund failed");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white">{CLIENT_COPY.deposits.title}</h1>
      <p className="mt-1 text-sm text-slate-400">{CLIENT_COPY.deposits.subtitle}</p>

      <div className="mt-6 glass-panel p-6">
        <label className="block text-sm">
          <span className="text-slate-400">{CLIENT_COPY.deposits.amountLabel}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field mt-2 max-w-xs"
          />
        </label>
        <button type="button" onClick={deposit} className="btn-primary mt-4">
          {CLIENT_COPY.deposits.generateInstructions}
        </button>
        {demoMode && (
          <button type="button" onClick={demoFund} className="btn-secondary mt-4 ml-0 sm:ml-3">
            {CLIENT_COPY.deposits.demoFunds}
          </button>
        )}
        {lastRef && (
          <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm">
            <p className="text-slate-400">{CLIENT_COPY.deposits.referenceLabel}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-mono text-lg text-amber-400">{lastRef}</p>
              <CopyButton text={lastRef} label={CLIENT_COPY.deposits.copyReference} />
            </div>
          </div>
        )}
        {msg && (
          <p className={`mt-3 text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
        )}
      </div>

      {isAdmin && pending.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-white">{CLIENT_COPY.deposits.pendingTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{CLIENT_COPY.deposits.pendingHint}</p>
          <ul className="mt-4 space-y-3">
            {pending.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 text-sm">
                <div>
                  <p className="font-medium text-white">
                    ${d.amountCad} CAD · {d.userName}
                  </p>
                  <p className="text-slate-400">{d.userEmail}</p>
                  <p className="font-mono text-xs text-amber-400/80">{d.reference}</p>
                </div>
                <button type="button" onClick={() => confirmDeposit(d.id)} className="btn-primary !py-2 text-xs">
                  {CLIENT_COPY.deposits.confirmReceived}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 font-semibold text-white">{CLIENT_COPY.deposits.historyTitle}</h2>
      {loading ? (
        <div className="mt-3">
          <LoadingRows count={2} />
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {deposits.length === 0 && (
            <li className="text-sm text-slate-500">{CLIENT_COPY.deposits.historyEmpty}</li>
          )}
          {deposits.map((d) => (
            <li
              key={d.id}
              className="flex justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm"
            >
              <span>
                ${d.amountCad} CAD · <span className="font-mono text-xs">{d.reference}</span>
              </span>
              <span className={d.status === "completed" ? "text-emerald-400" : "text-slate-400"}>
                {formatDepositStatus(d.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
