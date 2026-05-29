"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Me = {
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  organization?: { name: string } | null;
  wallet?: { address?: string };
};

type Ledger = {
  id: string;
  type: string;
  currency: string;
  amount: string;
  balanceAfter: string;
  description?: string;
  createdAt: string;
};

type TelegramLink = {
  command: string;
  bot: string;
  expiresAt: string;
};

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [telegram, setTelegram] = useState<TelegramLink | null>(null);

  useEffect(() => {
    Promise.all([api<Me>("/api/auth/me"), api<Ledger[]>("/api/wallet/ledger")]).then(([m, l]) => {
      setMe(m);
      setLedger(l.slice(0, 20));
    });
  }, []);

  async function generateTelegramLink() {
    const link = await api<TelegramLink>("/api/account/telegram-link", { method: "POST" });
    setTelegram(link);
  }

  if (!me) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <dl className="mt-6 space-y-3 rounded-xl border border-slate-700 bg-[#111827] p-6 text-sm">
        <Row label="Name" value={me.fullName} />
        <Row label="Email" value={me.email} />
        <Row label="Role" value={me.role} />
        <Row label="Organization" value={me.organization?.name ?? "—"} />
        <Row label="Wallet address" value={me.wallet?.address ?? "—"} mono />
      </dl>

      <div className="mt-8 rounded-xl border border-slate-700 bg-[#111827] p-6">
        <h2 className="font-semibold">Telegram (@VIRLUXBOT)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Generate a one-time link code, then send it to the bot in Telegram.
        </p>
        <button
          type="button"
          onClick={generateTelegramLink}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
        >
          Generate link code
        </button>
        {telegram && (
          <div className="mt-4 rounded-lg bg-slate-900 p-4 font-mono text-sm">
            <p>
              Open @{telegram.bot} and send: <span className="text-green-400">{telegram.command}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Expires {new Date(telegram.expiresAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <h2 className="mt-10 font-semibold">Ledger (recent)</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {ledger.map((e) => (
          <li key={e.id} className="flex justify-between rounded-lg border border-slate-700 px-4 py-2">
            <span>
              {e.type} {e.amount} {e.currency}
            </span>
            <span className="text-slate-400">bal {e.balanceAfter}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className={mono ? "font-mono text-xs truncate max-w-[60%]" : ""}>{value}</dd>
    </div>
  );
}
