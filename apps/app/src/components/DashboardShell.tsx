"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-virlux-bg">
        <div
          className={`fixed inset-0 z-40 bg-black/60 lg:hidden ${menuOpen ? "block" : "hidden"}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto ${
            menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } transition-transform duration-200`}
        >
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-virlux-bg/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white"
            >
              ☰
            </button>
            <span className="font-semibold text-white">VIRLUX</span>
          </header>
          <main className="flex-1 overflow-auto bg-app-gradient p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
