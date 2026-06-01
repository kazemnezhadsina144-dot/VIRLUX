"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatAuditAction } from "@virlux/shared";

type Log = { id: string; action: string; metadata: unknown; createdAt: string };

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Log[]>("/api/audit")
      .then(setLogs)
      .catch((e) => setErr(e instanceof Error ? e.message : "Access denied"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Activity log</h1>
      <p className="mt-1 text-sm text-slate-400">Payment and account events for your organization</p>
      {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
      {loading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="rounded-lg border border-white/[0.06] px-4 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-medium text-white">{formatAuditAction(l.action)}</span>
                <span className="shrink-0 text-slate-500">{new Date(l.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
          {logs.length === 0 && !err && <p className="text-slate-500">No activity yet</p>}
        </ul>
      )}
    </div>
  );
}
