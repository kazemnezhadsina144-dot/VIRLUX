"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Log = { id: string; action: string; metadata: unknown; createdAt: string };

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Log[]>("/api/audit")
      .then(setLogs)
      .catch((e) => setErr(e instanceof Error ? e.message : "Access denied"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Activity log</h1>
      <p className="mt-1 text-sm text-slate-400">Payment and account events for your organization</p>
      {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
      <ul className="mt-6 space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="rounded-lg border border-slate-700 px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{l.action}</span>
              <span className="text-slate-500">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
            {l.metadata != null && (
              <pre className="mt-2 overflow-x-auto text-xs text-slate-500">
                {JSON.stringify(l.metadata, null, 2)}
              </pre>
            )}
          </li>
        ))}
        {logs.length === 0 && !err && <p className="text-slate-500">No audit entries yet</p>}
      </ul>
    </div>
  );
}
