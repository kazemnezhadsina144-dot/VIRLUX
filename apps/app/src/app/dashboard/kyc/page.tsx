"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth, canManageTeam } from "@/lib/auth-context";
import { formatKycStatus } from "@virlux/shared";
import { EmptyState } from "@/components/ui/EmptyState";

type Kyc = {
  kycStatus: string;
  submissions: { id: string; documentType: string; status: string; createdAt: string }[];
};

type KycQueueItem = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentType: string;
  documentNumberMasked: string;
  country: string;
  status: string;
  createdAt: string;
};

export default function KycPage() {
  const me = useAuth();
  const isReviewer = canManageTeam(me?.role);
  const [status, setStatus] = useState<Kyc | null>(null);
  const [queue, setQueue] = useState<KycQueueItem[]>([]);
  const [docType, setDocType] = useState("passport");
  const [docNum, setDocNum] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    Promise.all([
      api<Kyc>("/api/kyc/status"),
      isReviewer ? api<KycQueueItem[]>("/api/kyc/review/queue").catch(() => [] as KycQueueItem[]) : Promise.resolve([]),
    ])
      .then(([s, q]) => {
        setStatus(s);
        setQueue(q);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [isReviewer]);

  async function submit() {
    setMsg("");
    try {
      await api("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify({ documentType: docType, documentNumber: docNum }),
      });
      setMsgType("success");
      setMsg("Submitted for review.");
      setTimeout(load, 1500);
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function approve(id: string) {
    await api(`/api/kyc/review/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
    load();
  }

  async function reject(id: string) {
    const notes = rejectNotes[id]?.trim();
    if (!notes || notes.length < 3) {
      setMsgType("error");
      setMsg("Rejection requires notes (min 3 characters).");
      return;
    }
    await api(`/api/kyc/review/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    load();
  }

  if (loading && !status) {
    return (
      <div className="max-w-3xl space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Business verification</h1>
      <p className="mt-1 text-sm text-slate-400">Required before you can send payments or add funds</p>

      <div className="mt-6 glass-panel p-6">
        <p className="text-sm">
          Your status:{" "}
          <span className={status?.kycStatus === "approved" ? "text-emerald-400" : "text-amber-400"}>
            {formatKycStatus(status?.kycStatus ?? "pending")}
          </span>
        </p>

        {status?.kycStatus !== "approved" && (
          <div className="mt-4 space-y-3">
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input-field text-sm">
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver&apos;s license</option>
              <option value="national_id">National ID</option>
            </select>
            <input
              placeholder="Document number"
              value={docNum}
              onChange={(e) => setDocNum(e.target.value)}
              className="input-field text-sm"
            />
            <label className="block text-xs text-slate-500">
              Document upload (pilot): attach via email to support if counsel requires originals.
              <input type="file" className="mt-2 block w-full text-sm text-slate-400" disabled title="Upload coming with counsel review" />
            </label>
            <button type="button" onClick={submit} className="btn-primary">
              Submit documents
            </button>
          </div>
        )}
        {msg && <p className={`mt-3 text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
      </div>

      {status?.submissions && status.submissions.length > 0 && (
        <>
          <h2 className="mt-8 font-semibold text-white">Your submission history</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {status.submissions.map((s) => (
              <li key={s.id} className="flex justify-between rounded-xl border border-white/[0.06] px-4 py-2">
                <span>{s.documentType}</span>
                <span className="text-slate-400">{formatKycStatus(s.status)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {isReviewer && (
        <section className="mt-10">
          <h2 className="font-semibold text-white">Review queue</h2>
          <p className="mt-1 text-sm text-slate-500">Review verification for your organization</p>
          {queue.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No submissions awaiting review" />
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {queue.map((item) => (
                <li key={item.id} className="glass-panel p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{item.userName}</p>
                      <p className="text-slate-400">{item.userEmail}</p>
                      <p className="mt-1 text-slate-300">
                        {item.documentType} · {item.documentNumberMasked} · {item.country}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <button type="button" onClick={() => approve(item.id)} className="btn-primary !py-2 text-xs">
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
                        onClick={() => reject(item.id)}
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
      )}
    </div>
  );
}
