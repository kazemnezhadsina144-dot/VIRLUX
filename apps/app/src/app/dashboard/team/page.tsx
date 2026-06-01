"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";

type Member = { id: string; email: string; fullName: string; role: string; kycStatus: string };
type Invite = { id: string; email: string; role: string; token: string; expiresAt: string };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "approver" | "viewer">("approver");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      api<Member[]>("/api/team/members"),
      api<Invite[]>("/api/team/invites").catch(() => [] as Invite[]),
    ])
      .then(([m, i]) => {
        setMembers(m);
        setInvites(i);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function invite() {
    setMsg("");
    try {
      const res = await api<{ acceptUrl: string }>("/api/team/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setLastInviteUrl(res.acceptUrl);
      setMsgType("success");
      setMsg("Invite created — share the link below.");
      setEmail("");
      load();
    } catch (e) {
      setMsgType("error");
      setMsg(e instanceof Error ? e.message : "Invite failed");
    }
  }

  async function changeRole(memberId: string, newRole: string) {
    await api(`/api/team/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-white">Team</h1>
      <p className="mt-1 text-sm text-slate-400">Manage members and approvers for your organization</p>

      <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
        <strong className="text-white">Roles:</strong> Admins manage team and settings. Approvers review payments over
        your threshold. Viewers can see balances and history only.
      </div>

      <div className="mt-6 glass-panel p-6">
        <h2 className="font-medium text-white">Invite member</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            type="email"
            placeholder="email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field min-w-[200px] flex-1 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="input-field text-sm"
          >
            <option value="approver">Approver</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="button" onClick={invite} className="btn-primary">
            Send invite
          </button>
        </div>
        {lastInviteUrl && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-black/30 p-3 text-sm">
            <span className="break-all font-mono text-xs text-slate-300">{lastInviteUrl}</span>
            <CopyButton text={lastInviteUrl} label="Copy link" />
          </div>
        )}
        {msg && <p className={`mt-3 text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
      </div>

      <h2 className="mt-10 font-semibold text-white">Members</h2>
      {loading ? (
        <div className="mt-3 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No team members yet" description="Invite your finance team to get started." />
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-white">{m.fullName}</p>
                <p className="text-slate-400">{m.email}</p>
              </div>
              {m.role === "owner" ? (
                <span className="badge-amber capitalize">{m.role}</span>
              ) : (
                <select
                  value={m.role}
                  onChange={(e) => changeRole(m.id, e.target.value)}
                  className="input-field !py-1.5 text-xs"
                >
                  <option value="admin">admin</option>
                  <option value="approver">approver</option>
                  <option value="viewer">viewer</option>
                </select>
              )}
            </li>
          ))}
        </ul>
      )}

      {invites.length > 0 && (
        <>
          <h2 className="mt-10 font-semibold text-white">Pending invites</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invites.map((i) => (
              <li key={i.id} className="rounded-xl border border-white/[0.06] px-4 py-2 text-slate-300">
                {i.email} · {i.role} · expires {new Date(i.expiresAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
