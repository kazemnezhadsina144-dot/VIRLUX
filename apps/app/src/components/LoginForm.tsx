"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { isPublicDemoMode, DEMO_LOGIN } from "@virlux/shared";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const demoMode = isPublicDemoMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);

  function fillDemo() {
    setEmail(DEMO_LOGIN.email);
    setPassword(DEMO_LOGIN.password);
    setShowDemoHint(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      if (mode === "login") {
        await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      } else {
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName, organizationName: orgName }),
        });
        setMsgType("success");
        setMsg("Account created. You can sign in now.");
        setMode("login");
      }
    } catch (err) {
      setMsgType("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
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
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "register" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
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
                  <p className="text-xs text-slate-400">Staging demo — pre-funded balance, verified business.</p>
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
            <div>
              <label className="block text-sm text-slate-400">Email</label>
              <input
                type="email"
                className="input-field mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">Password</label>
              <input
                type="password"
                className="input-field mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
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
