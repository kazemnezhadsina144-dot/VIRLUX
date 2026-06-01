"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, setSession } from "@/lib/api";

const WEB = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [mode, setMode] = useState<"login" | "register">(inviteToken ? "register" : "login");
  const [email, setEmail] = useState("demo@virlux.com");
  const [password, setPassword] = useState("demo12345");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/auth/me")
      .then(() => router.replace("/dashboard"))
      .catch(() => {});
  }, [router]);

  async function acceptInviteIfNeeded() {
    if (!inviteToken) return;
    await api("/api/team/accept", {
      method: "POST",
      body: JSON.stringify({ token: inviteToken }),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, fullName: fullName || "New User", companyName: companyName || undefined };
      const res = await api<{ accessToken: string; refreshToken: string }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSession(res.accessToken, res.refreshToken);
      if (inviteToken) {
        try {
          await acceptInviteIfNeeded();
        } catch (inviteErr) {
          setError(
            inviteErr instanceof Error
              ? inviteErr.message
              : "Signed in, but invite could not be accepted. Check your email matches the invite."
          );
          router.push("/dashboard");
          return;
        }
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-virlux-surface p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_60%)]" />
        <div className="relative">
          <Link href={WEB} className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              V
            </span>
            <span className="text-xl font-bold text-white">VIRLUX</span>
          </Link>
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Canadian B2B · 2026</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white">
            Finance dashboard for cross-border teams
          </h1>
          <ul className="mt-8 space-y-4 text-sm text-slate-400">
            {[
              "Interac CAD funding with clear references",
              "Live rates with a flat 1% fee",
              "Payment approvals for high-value sends",
              "Complete payment history for your team",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">© VIRLUX · Built for Canadian SMEs</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-virlux-bg px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href={WEB} className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                V
              </span>
              <span className="text-lg font-bold text-white">VIRLUX</span>
            </Link>
          </div>

          {inviteToken && (
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
              Team invite detected — register or sign in with the invited email.
            </div>
          )}

          <h2 className="text-2xl font-bold text-white">
            {mode === "login" ? "Welcome back" : "Register your business"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login" ? "Sign in to manage payments and approvals" : "Create your organization workspace"}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <>
                <input
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={8}
            />
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full !py-3">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-300"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "New to VIRLUX? Create an account" : "Already have an account? Sign in"}
          </button>

          {!inviteToken && process.env.NODE_ENV === "development" && (
            <p className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-slate-600">
              Dev demo: demo@virlux.com / demo12345
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-virlux-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
