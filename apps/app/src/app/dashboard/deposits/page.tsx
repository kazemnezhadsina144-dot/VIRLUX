"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth, canManageTeam } from "@/lib/auth-context";

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
  const isAdmin = canManageTeam(me?.role);
  const [amount, setAmount] = useState("1000");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pending, setPending] = useState<PendingDeposit[]>([]);
  const [msg, setMsg] = useState("");
  const [lastRef, setLastRef] = useState("");

  function load() {
    api<Deposit[]>("/api/wallet/deposits").then(setDeposits);
    if (isAdmin) {
      api<PendingDeposit[]>("/api/wallet/deposits/pending").then(setPending).catch(() => setPending([]));
    }
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
      setMsg(res.instructions.message);
      setTimeout(load, 1500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Deposit failed");
    }
  }

  async function confirmDeposit(id: string) {
    await api(`/api/wallet/deposits/${id}/confirm`, { method: "POST" });
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Add funds</h1>
      <p className="mt-1 text-sm text-slate-400">Fund your account via Interac e-Transfer</p>

      <div className="mt-6 glass-panel p-6">
        <label className="block text-sm">
          <span className="text-slate-400">Amount (CAD)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field mt-2 max-w-xs"
          />
        </label>
        <button type="button" onClick={deposit} className="btn-primary mt-4">
          Generate Interac instructions
        </button>
        {lastRef && (
          <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm">
            <p className="text-slate-400">Reference (use in Interac message):</p>
            <p className="mt-1 font-mono text-lg text-amber-400">{lastRef}</p>
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}
      </div>

      {isAdmin && pending.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-white">Pending Interac confirmations</h2>
          <p className="mt-1 text-sm text-slate-500">Mark received after verifying bank deposit</p>
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
                  Confirm received
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 font-semibold text-white">Deposit history</h2>
      <ul className="mt-3 space-y-2">
        {deposits.length === 0 && <li className="text-sm text-slate-500">No deposits yet</li>}
        {deposits.map((d) => (
          <li
            key={d.id}
            className="flex justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm"
          >
            <span>
              ${d.amountCad} CAD · <span className="font-mono text-xs">{d.reference}</span>
            </span>
            <span className={d.status === "completed" ? "text-emerald-400" : "text-slate-400"}>{d.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
