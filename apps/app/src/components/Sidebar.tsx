"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/api";
import { useAuth, canSend, canManageTeam, canViewAudit } from "@/lib/auth-context";

const ICONS: Record<string, string> = {
  Overview: "◉",
  Send: "↗",
  Deposits: "↓",
  Transactions: "≡",
  Team: "👥",
  KYC: "✓",
  "Audit log": "📋",
  Settings: "⚙",
};

const allLinks = [
  { href: "/dashboard", label: "Overview", show: () => true },
  { href: "/dashboard/send", label: "Send", show: canSend },
  { href: "/dashboard/deposits", label: "Deposits", show: canSend },
  { href: "/dashboard/transactions", label: "Transactions", show: () => true },
  { href: "/dashboard/team", label: "Team", show: canManageTeam },
  { href: "/dashboard/kyc", label: "KYC", show: () => true },
  { href: "/dashboard/audit", label: "Audit log", show: canViewAudit },
  { href: "/dashboard/settings", label: "Settings", show: () => true },
];

export function Sidebar() {
  const path = usePathname();
  const me = useAuth();
  const web = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3100";
  const links = allLinks.filter((l) => l.show(me?.role));

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
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-600/15 font-medium text-blue-300 ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-xs opacity-70">{ICONS[l.label] ?? "·"}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/[0.06] p-4 text-xs text-slate-500">
        <a href={web} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.04] hover:text-slate-300">
          ← Marketing site
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
