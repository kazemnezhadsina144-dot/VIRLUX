"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_COPY } from "@virlux/shared";
import { logout, api } from "@/lib/api";
import { useAuth, canSend, canManageTeam, canViewAudit, canApprove } from "@/lib/auth-context";
import { parseTransactionsResponse } from "@/lib/transactions";

const ICONS: Record<string, string> = {
  [CLIENT_COPY.nav.overview]: "◉",
  [CLIENT_COPY.nav.send]: "↗",
  [CLIENT_COPY.nav.addFunds]: "↓",
  [CLIENT_COPY.nav.payments]: "≡",
  [CLIENT_COPY.nav.approvals]: "✓",
  [CLIENT_COPY.nav.team]: "👥",
  [CLIENT_COPY.nav.verification]: "✓",
  [CLIENT_COPY.nav.activityLog]: "📋",
  [CLIENT_COPY.nav.platformOps]: "⚡",
  [CLIENT_COPY.nav.settings]: "⚙",
};

function canAccessPlatform(me: ReturnType<typeof useAuth>) {
  return Boolean(me?.isPlatformAdmin);
}

const allLinks = [
  { href: "/dashboard", label: CLIENT_COPY.nav.overview, show: () => true },
  { href: "/dashboard/send", label: CLIENT_COPY.nav.send, show: (me: ReturnType<typeof useAuth>) => canSend(me?.role) },
  {
    href: "/dashboard/deposits",
    label: CLIENT_COPY.nav.addFunds,
    show: (me: ReturnType<typeof useAuth>) => canSend(me?.role),
  },
  { href: "/dashboard/transactions", label: CLIENT_COPY.nav.payments, show: () => true },
  {
    href: "/dashboard/approvals",
    label: CLIENT_COPY.nav.approvals,
    show: (me: ReturnType<typeof useAuth>) => canApprove(me?.role),
    badge: true,
  },
  { href: "/dashboard/team", label: CLIENT_COPY.nav.team, show: (me: ReturnType<typeof useAuth>) => canManageTeam(me?.role) },
  { href: "/dashboard/kyc", label: CLIENT_COPY.nav.verification, show: () => true },
  {
    href: "/dashboard/audit",
    label: CLIENT_COPY.nav.activityLog,
    show: (me: ReturnType<typeof useAuth>) => canViewAudit(me?.role),
  },
  { href: "/dashboard/platform", label: CLIENT_COPY.nav.platformOps, show: canAccessPlatform },
  { href: "/dashboard/settings", label: CLIENT_COPY.nav.settings, show: () => true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const me = useAuth();
  const web = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3100";
  const links = allLinks.filter((l) => l.show(me));
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    if (!canApprove(me?.role)) return;
    api<unknown>("/api/transactions?status=awaiting_approval")
      .then((data) => setPendingApprovals(parseTransactionsResponse(data).length))
      .catch(() => setPendingApprovals(0));
  }, [me?.role, path]);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-virlux-surface">
      <div className="border-b border-white/[0.06] p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white shadow-glow">
            V
          </span>
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">VIRLUX</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Business</span>
          </div>
        </Link>
      </div>

      {me && (
        <div className="border-b border-white/[0.06] px-5 py-4">
          <p className="truncate text-sm font-medium text-white">{me.fullName}</p>
          <p className="truncate text-xs text-slate-500">{me.organization?.name ?? me.email}</p>
          <span className="badge-slate mt-2 capitalize">{me.role}</span>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map((l) => {
          const active = path === l.href || path.startsWith(l.href + "/");
          const badge = "badge" in l && l.badge && pendingApprovals > 0 ? pendingApprovals : 0;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-600/15 font-medium text-blue-300 ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-xs opacity-70">{ICONS[l.label] ?? "·"}</span>
              <span className="flex-1">{l.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/[0.06] p-4 text-xs text-slate-500">
        <a href={web} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.04] hover:text-slate-300">
          ← virlux.com
        </a>
        <button
          type="button"
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-red-500/10 hover:text-red-400"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
