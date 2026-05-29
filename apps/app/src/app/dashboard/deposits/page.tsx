"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Deposit = {
  id: string;
  reference: string;
  amountCad: string;
  status: string;
  createdAt: string;
  completedAt?: string;
};

export default function DepositsPage() {
  const [amount, setAmount] = useState("1000");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [msg, setMsg] = useState("");
  const [lastRef, setLastRef] = useState("");

  function load() {
    api<Deposit[]>("/api/wallet/deposits").then(setDeposits);
  }

  useEffect(() => {
    load();
  }, []);

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
      setTimeout(load, 2500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Deposit failed");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Deposit CAD</h1>
      <p className="mt-1 text-sm text-slate-400">Fund your account via Interac e-Transfer</p>

      <div className="mt-6 rounded-xl border border-slate-700 bg-[#111827] p-6">
        <label className="block text-sm">
          <span className="text-slate-400">Amount (CAD)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={deposit}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
        >
          Generate Interac instructions
        </button>
        {lastRef && (
          <div className="mt-4 rounded-lg bg-slate-900 p-4 text-sm">
            <p className="text-slate-400">Reference (use in Interac message):</p>
            <p className="mt-1 font-mono text-lg text-amber-400">{lastRef}</p>
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}
      </div>

      <h2 className="mt-10 font-semibold">Deposit history</h2>
      <ul className="mt-3 space-y-2">
        {deposits.length === 0 && <li className="text-sm text-slate-500">No deposits yet</li>}
        {deposits.map((d) => (
          <li key={d.id} className="flex justify-between rounded-lg border border-slate-700 px-4 py-3 text-sm">
            <span>
              ${d.amountCad} CAD · <span className="font-mono text-xs">{d.reference}</span>
            </span>
            <span className="text-slate-400">{d.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
