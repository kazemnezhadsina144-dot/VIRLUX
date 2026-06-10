"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { isPublicDemoMode, DEMO_LOGIN_EMAIL } from "@virlux/shared";
import { trackEvent } from "@/lib/analytics";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const demoMode = isPublicDemoMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);

  function fillDemo() {
    setEmail(DEMO_LOGIN_EMAIL);
    setPassword("");
    setShowDemoHint(false);
  }

  const showRegister = demoMode || process.env.NODE_ENV === "development";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      if (mode === "login") {
        const body: { email: string; password: string; totpCode?: string } = { email, password };
        if (totpCode.trim()) body.totpCode = totpCode.trim();
        await api("/api/auth/login", { method: "POST", body: JSON.stringify(body) });
        router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      } else {
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName, companyName: orgName }),
        });
        trackEvent("register");
        setMsgType("success");
        setMsg("Account created. You can sign in now.");
        setMode("login");
      }
    } catch (err) {
      setMsgType("error");
      if (err instanceof ApiRequestError && err.code === "MFA_REQUIRED") {
        setNeedsMfa(true);
      }
      const raw = err instanceof Error ? err.message : "Something went wrong";
      const friendly =
        raw.includes("API unreachable") || raw.includes("Application not found") || raw.includes("502")
          ? "Dashboard is temporarily unavailable. Try again shortly or book a demo from virlux.com."
          : raw;
      setMsg(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gradient px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white">
              V
            </span>
            <span className="text-2xl font-bold text-white">VIRLUX</span>
          </Link>
          <p className="mt-2 text-sm text-slate-400">International payments for Canadian business</p>
        </div>

        <div className="glass-panel p-8">
          <div className="mb-6 flex rounded-xl bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "login" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign in
            </button>
            {showRegister && (
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === "register" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            )}
          </div>

          {(demoMode || process.env.NODE_ENV === "development") && (
            <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <button
                type="button"
                onClick={() => setShowDemoHint((s) => !s)}
                className="text-xs font-medium text-blue-300"
              >
                Try demo account {showDemoHint ? "▲" : "▼"}
              </button>
              {showDemoHint && (
                <div className="mt-2">
                  <p className="text-xs text-slate-400">
                    Staging demo — email prefilled; password from your team runbook (not stored in git).
                  </p>
                  <button type="button" onClick={fillDemo} className="btn-secondary mt-2 w-full text-xs">
                    Use demo credentials
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm text-slate-400">Full name</label>
                  <input className="input-field mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Company name</label>
                  <input className="input-field mt-1" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                </div>
              </>
            )}
            <label className="block text-sm text-slate-400">
              Email
              <input
                type="email"
                className="input-field mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="block text-sm text-slate-400">
              Password
              <input
                type="password"
                className="input-field mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "register" ? 12 : 8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
            {needsMfa && (
              <label className="block text-sm text-slate-400">
                Authentication code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  className="input-field mt-1 tracking-widest"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  placeholder="6-digit code"
                />
              </label>
            )}
            {msg && (
              <p className={`text-sm ${msgType === "success" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
