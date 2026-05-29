"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Member = { id: string; email: string; fullName: string; role: string; kycStatus: string };
type Invite = { id: string; email: string; role: string; token: string; expiresAt: string };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "approver" | "viewer">("approver");
  const [msg, setMsg] = useState("");

  function load() {
    Promise.all([
      api<Member[]>("/api/team/members"),
      api<Invite[]>("/api/team/invites").catch(() => [] as Invite[]),
    ]).then(([m, i]) => {
      setMembers(m);
      setInvites(i);
    });
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
      setMsg(`Invite sent. Share link: ${res.acceptUrl}`);
      setEmail("");
      load();
    } catch (e) {
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
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-slate-400">Manage members and approvers for your organization</p>

      <div className="mt-6 rounded-xl border border-slate-700 bg-[#111827] p-6">
        <h2 className="font-medium">Invite member</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            type="email"
            placeholder="email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="approver">Approver</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="button"
            onClick={invite}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium"
          >
            Send invite
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-amber-400 break-all">{msg}</p>}
      </div>

      <h2 className="mt-10 font-semibold">Members</h2>
      <ul className="mt-3 space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{m.fullName}</p>
              <p className="text-slate-400">{m.email}</p>
            </div>
            {m.role === "owner" ? (
              <span className="text-amber-400">owner</span>
            ) : (
              <select
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value)}
                className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
              >
                <option value="admin">admin</option>
                <option value="approver">approver</option>
                <option value="viewer">viewer</option>
              </select>
            )}
          </li>
        ))}
      </ul>

      {invites.length > 0 && (
        <>
          <h2 className="mt-10 font-semibold">Pending invites</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invites.map((i) => (
              <li key={i.id} className="rounded-lg border border-slate-700 px-4 py-2">
                {i.email} · {i.role} · expires {new Date(i.expiresAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
