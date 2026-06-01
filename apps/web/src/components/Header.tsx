import Link from "next/link";
import { BookDemoLink } from "./BookDemoLink";
import { MobileNav } from "./MobileNav";
import { PUBLIC_COPY } from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/demo", label: "Demo" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-virlux-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white shadow-glow">
            V
          </span>
          <span className="text-xl font-bold tracking-tight text-white">VIRLUX</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/privacy" className="nav-link">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav />
          <Link href={APP_URL} className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline">
            Sign in
          </Link>
          <BookDemoLink className="hidden sm:inline-flex btn-secondary !px-4 !py-2.5 text-sm" />
          <Link href={APP_URL} className="btn-primary !px-4 !py-2.5 text-sm">
            {PUBLIC_COPY.ctaPrimary}
          </Link>
        </div>
      </div>
    </header>
  );
}
