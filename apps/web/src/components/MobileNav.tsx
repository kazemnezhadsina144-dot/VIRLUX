"use client";

import { useState } from "react";
import Link from "next/link";
import { BookDemoLink } from "./BookDemoLink";
import { PUBLIC_COPY } from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/demo", label: "Demo" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white"
      >
        ☰
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <nav className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-1 border-l border-white/10 bg-virlux-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-white">Menu</span>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/privacy" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-slate-400">
              Privacy
            </Link>
            <div className="mt-auto space-y-2 pt-6">
              <Link href={APP_URL} className="btn-secondary block w-full text-center text-sm">
                Sign in
              </Link>
              <Link href={APP_URL} className="btn-primary block w-full text-center text-sm">
                {PUBLIC_COPY.ctaPrimary}
              </Link>
              <BookDemoLink className="btn-ghost block w-full text-center text-sm !border-white/10" />
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
