"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Kyc = {
  kycStatus: string;
  submissions: { id: string; documentType: string; status: string; createdAt: string }[];
};

export default function KycPage() {
  const [status, setStatus] = useState<Kyc | null>(null);
  const [docType, setDocType] = useState("passport");
  const [docNum, setDocNum] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    api<Kyc>("/api/kyc/status").then(setStatus);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setMsg("");
    try {
      await api("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify({ documentType: docType, documentNumber: docNum }),
      });
      setMsg("Submitted for review.");
      setTimeout(load, 3500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Identity verification</h1>
      <p className="mt-1 text-sm text-slate-400">Required by FINTRAC before moving funds</p>

      <div className="mt-6 rounded-xl border border-slate-700 bg-[#111827] p-6">
        <p className="text-sm">
          Status:{" "}
          <span className={status?.kycStatus === "approved" ? "text-green-400" : "text-amber-400"}>
            {status?.kycStatus ?? "…"}
          </span>
        </p>

        {status?.kycStatus !== "approved" && (
          <div className="mt-4 space-y-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver&apos;s license</option>
              <option value="national_id">National ID</option>
            </select>
            <input
              placeholder="Document number"
              value={docNum}
              onChange={(e) => setDocNum(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={submit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium"
            >
              Submit KYC
            </button>
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-amber-400">{msg}</p>}
      </div>

      {status?.submissions && status.submissions.length > 0 && (
        <>
          <h2 className="mt-8 font-semibold">Submission history</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {status.submissions.map((s) => (
              <li key={s.id} className="flex justify-between rounded-lg border border-slate-700 px-4 py-2">
                <span>{s.documentType}</span>
                <span className="text-slate-400">{s.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
