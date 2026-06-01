"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type KycQueueItem = {
  id: string;
  userEmail: string;
  userName: string;
  organizationName?: string;
  partnerName?: string;
  documentType: string;
  documentNumberMasked: string;
  country: string;
  createdAt: string;
};

type PendingDeposit = {
  id: string;
  userEmail: string;
  userName: string;
  organizationName?: string;
  partnerName?: string;
  amountCad: string;
  reference: string;
  createdAt: string;
};

type Partner = {
  id: string;
  legalName: string;
  fintracMsbNumber?: string;
  revShareBps: number;
  _count: { organizations: number };
};

type SubmittedTx = {
  id: string;
  amountIn: string;
  fromCurrency: string;
  amountOut: string;
  toStablecoin: string;
  recipientCountry?: string;
  submittedToPartnerAt?: string;
  user: { email: string; fullName: string; organization?: { name?: string; partner?: { legalName?: string } } };
};

export default function PlatformPage() {
  const me = useAuth();
  const [kycQueue, setKycQueue] = useState<KycQueueItem[]>([]);
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [submittedTxs, setSubmittedTxs] = useState<SubmittedTx[]>([]);
  const [msg, setMsg] = useState("");
  const [settlementIds, setSettlementIds] = useState<Record<string, string>>({});
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerSecret, setNewPartnerSecret] = useState("");
  const [pilotOrgId, setPilotOrgId] = useState("seed-org-demo");
  const [pilotCorridor, setPilotCorridor] = useState<"PH" | "US" | "">("PH");
  const [pilotVolumeCap, setPilotVolumeCap] = useState("50000");

  function load() {
    api<KycQueueItem[]>("/api/platform/kyc/queue").then(setKycQueue).catch(() => setKycQueue([]));
    api<PendingDeposit[]>("/api/platform/deposits/pending").then(setDeposits).catch(() => setDeposits([]));
    api<Partner[]>("/api/platform/partners").then(setPartners).catch(() => setPartners([]));
    api<SubmittedTx[]>("/api/platform/transactions/submitted")
      .then(setSubmittedTxs)
      .catch(() => setSubmittedTxs([]));
  }

  useEffect(() => {
    if (me?.isPlatformAdmin) load();
  }, [me?.isPlatformAdmin]);

  if (!me?.isPlatformAdmin) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white">Platform ops</h1>
        <p className="mt-4 text-sm text-slate-400">Access restricted to VIRLUX platform administrators.</p>
      </div>
    );
  }

  async function approveKyc(id: string) {
    await api(`/api/platform/kyc/review/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
    load();
  }

  async function rejectKyc(id: string) {
    const notes = rejectNotes[id]?.trim();
    if (!notes || notes.length < 3) {
      setMsg("Rejection requires notes (min 3 characters).");
      return;
    }
    await api(`/api/platform/kyc/review/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    load();
  }

  async function confirmDeposit(id: string) {
    await api(`/api/platform/deposits/${id}/confirm`, { method: "POST" });
    load();
  }

  async function markSettled(txId: string) {
    const partnerSettlementId = settlementIds[txId]?.trim();
    if (!partnerSettlementId) {
      setMsg("Settlement reference required.");
      return;
    }
    await api(`/api/platform/transactions/${txId}/mark-settled`, {
      method: "POST",
      body: JSON.stringify({ partnerSettlementId }),
    });
    load();
  }

  async function createPartner(e: React.FormEvent) {
    e.preventDefault();
    const legalName = newPartnerName.trim();
    const webhookSecret = newPartnerSecret.trim();
    if (legalName.length < 2) {
      setMsg("Partner legal name required.");
      return;
    }
    if (webhookSecret.length < 16) {
      setMsg("Webhook secret required (min 16 characters).");
      return;
    }
    await api("/api/platform/partners", {
      method: "POST",
      body: JSON.stringify({ legalName, webhookSecret }),
    });
    setNewPartnerName("");
    setNewPartnerSecret("");
    setMsg("Partner created.");
    load();
  }

  async function savePilotSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!pilotOrgId.trim()) {
      setMsg("Organization ID required.");
      return;
    }
    await api(`/api/platform/organizations/${pilotOrgId.trim()}/pilot-corridor`, {
      method: "PATCH",
      body: JSON.stringify({ pilotCorridor: pilotCorridor || null }),
    });
    await api(`/api/platform/organizations/${pilotOrgId.trim()}/pilot-volume-cap`, {
      method: "PATCH",
      body: JSON.stringify({ pilotVolumeCapCad: pilotVolumeCap ? Number(pilotVolumeCap) : null }),
    });
    setMsg("Pilot corridor and volume cap updated.");
  }

  async function downloadFintrac() {
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/platform/exports/fintrac?from=${from}&to=${to}`, { credentials: "include" });
    if (!res.ok) {
      setMsg("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `virlux-fintrac-${from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform ops</h1>
          <p className="mt-1 text-sm text-slate-400">Cross-org KYC, deposits, and MSB partner overview</p>
        </div>
        <button type="button" onClick={downloadFintrac} className="btn-primary !py-2 text-xs">
          Export FINTRAC CSV (90d)
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-amber-400">{msg}</p>}

      <section className="mt-8">
        <h2 className="font-semibold text-white">MSB partners ({partners.length})</h2>
        <form onSubmit={createPartner} className="mt-4 flex flex-wrap gap-2 glass-panel p-4">
          <input
            placeholder="Partner legal name"
            value={newPartnerName}
            onChange={(e) => setNewPartnerName(e.target.value)}
            className="input-field !py-2 text-xs flex-1 min-w-[180px]"
          />
          <input
            placeholder="Webhook secret (16+ chars)"
            value={newPartnerSecret}
            onChange={(e) => setNewPartnerSecret(e.target.value)}
            className="input-field !py-2 text-xs flex-1 min-w-[180px]"
          />
          <button type="submit" className="btn-primary !py-2 text-xs">
            Add partner
          </button>
        </form>
        {partners.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No partners configured yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {partners.map((p) => (
              <li key={p.id} className="glass-panel flex justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-white">{p.legalName}</p>
                  <p className="text-slate-400">
                    Rev share: {(p.revShareBps / 100).toFixed(2)}% · Orgs: {p._count.organizations}
                  </p>
                </div>
                {p.fintracMsbNumber && (
                  <span className="text-xs text-slate-500">MSB {p.fintracMsbNumber}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-white">KYC queue ({kycQueue.length})</h2>
        {kycQueue.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No submissions awaiting review.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {kycQueue.map((item) => (
              <li key={item.id} className="glass-panel p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{item.userName}</p>
                    <p className="text-slate-400">{item.userEmail}</p>
                    <p className="text-xs text-slate-500">
                      {item.organizationName}
                      {item.partnerName ? ` · via ${item.partnerName}` : ""}
                    </p>
                    <p className="mt-1 text-slate-300">
                      {item.documentType} · {item.documentNumberMasked} · {item.country}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <button type="button" onClick={() => approveKyc(item.id)} className="btn-primary !py-2 text-xs">
                      Approve
                    </button>
                    <input
                      placeholder="Rejection reason"
                      value={rejectNotes[item.id] ?? ""}
                      onChange={(e) => setRejectNotes((p) => ({ ...p, [item.id]: e.target.value }))}
                      className="input-field !py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => rejectKyc(item.id)}
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-white">Pending Interac ({deposits.length})</h2>
        {deposits.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No pending deposits.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {deposits.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 text-sm">
                <div>
                  <p className="font-medium text-white">
                    ${d.amountCad} CAD · {d.userName}
                  </p>
                  <p className="text-slate-400">{d.userEmail}</p>
                  <p className="text-xs text-slate-500">
                    {d.organizationName}
                    {d.partnerName ? ` · via ${d.partnerName}` : ""}
                  </p>
                  <p className="font-mono text-xs text-amber-400/80">{d.reference}</p>
                </div>
                <button type="button" onClick={() => confirmDeposit(d.id)} className="btn-primary !py-2 text-xs">
                  Confirm received
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-white">Awaiting settlement confirmation ({submittedTxs.length})</h2>
        {submittedTxs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No transactions submitted to MSB partner.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {submittedTxs.map((tx) => (
              <li key={tx.id} className="glass-panel p-4 text-sm">
                <p className="font-medium text-white">
                  {tx.amountIn} {tx.fromCurrency} → {tx.amountOut} {tx.toStablecoin}
                </p>
                <p className="text-slate-400">{tx.user.fullName} · {tx.user.email}</p>
                <p className="text-xs text-slate-500">
                  {tx.user.organization?.name}
                  {tx.user.organization?.partner?.legalName
                    ? ` · via ${tx.user.organization.partner.legalName}`
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    placeholder="Settlement reference"
                    value={settlementIds[tx.id] ?? ""}
                    onChange={(e) => setSettlementIds((p) => ({ ...p, [tx.id]: e.target.value }))}
                    className="input-field !py-2 text-xs flex-1 min-w-[200px]"
                  />
                  <button type="button" onClick={() => markSettled(tx.id)} className="btn-primary !py-2 text-xs">
                    Mark settled
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 glass-panel p-6">
        <h2 className="font-semibold text-white">Organization pilot settings</h2>
        <p className="mt-1 text-sm text-slate-500">Lock corridor and 30-day volume cap for design partners</p>
        <form onSubmit={savePilotSettings} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-400">Organization ID</span>
            <input
              value={pilotOrgId}
              onChange={(e) => setPilotOrgId(e.target.value)}
              className="input-field mt-1 font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Pilot corridor</span>
            <select
              value={pilotCorridor}
              onChange={(e) => setPilotCorridor(e.target.value as "PH" | "US" | "")}
              className="input-field mt-1"
            >
              <option value="">None</option>
              <option value="PH">Philippines (PH)</option>
              <option value="US">United States (US)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Volume cap (CAD / 30 days)</span>
            <input
              type="number"
              value={pilotVolumeCap}
              onChange={(e) => setPilotVolumeCap(e.target.value)}
              className="input-field mt-1"
            />
          </label>
          <button type="submit" className="btn-primary sm:col-span-2 sm:w-fit">
            Save pilot settings
          </button>
        </form>
      </section>
    </div>
  );
}
