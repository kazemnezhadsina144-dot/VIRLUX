"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Me = {
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  organization?: { name: string } | null;
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
  const [activity, setActivity] = useState<Ledger[]>([]);
  const [telegram, setTelegram] = useState<TelegramLink | null>(null);

  useEffect(() => {
    Promise.all([api<Me>("/api/auth/me"), api<Ledger[]>("/api/wallet/ledger")]).then(([m, l]) => {
      setMe(m);
      setActivity(l.slice(0, 20));
    });
  }, []);

  async function generateTelegramLink() {
    const link = await api<TelegramLink>("/api/account/telegram-link", { method: "POST" });
    setTelegram(link);
  }

  if (!me) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-400">Account details and notifications</p>

      <dl className="mt-6 space-y-3 glass-panel p-6 text-sm">
        <Row label="Name" value={me.fullName} />
        <Row label="Email" value={me.email} />
        <Row label="Role" value={me.role} />
        <Row label="Organization" value={me.organization?.name ?? "—"} />
      </dl>

      <div className="mt-8 glass-panel p-6">
        <h2 className="font-semibold text-white">Payment notifications</h2>
        <p className="mt-1 text-sm text-slate-400">
          Link Telegram to receive payment updates from @VIRLUXBOT.
        </p>
        <button type="button" onClick={generateTelegramLink} className="btn-primary mt-4 !py-2 text-sm">
          Generate link code
        </button>
        {telegram && (
          <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm">
            <p>
              Open @{telegram.bot} and send:{" "}
              <span className="font-mono text-emerald-400">{telegram.command}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Expires {new Date(telegram.expiresAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <h2 className="mt-10 font-semibold text-white">Recent account activity</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {activity.length === 0 && <li className="text-slate-500">No activity yet</li>}
        {activity.map((e) => (
          <li key={e.id} className="flex justify-between rounded-xl border border-white/[0.06] px-4 py-2">
            <span className="text-slate-300">
              {e.description ?? `${e.type} ${e.amount} ${e.currency}`}
            </span>
            <span className="text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}
