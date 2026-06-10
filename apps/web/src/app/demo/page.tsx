import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookDemoLink } from "@/components/BookDemoLink";
import { PUBLIC_COPY, POSITIONING } from "@virlux/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const LOOM_URL = process.env.NEXT_PUBLIC_DEMO_LOOM_URL?.trim();

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-virlux-bg">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="section-label">Product demo</p>
        <h1 className="mt-2 text-3xl font-bold text-white">See VIRLUX in action</h1>
        <p className="mt-4 max-w-2xl text-slate-400">{POSITIONING.description}</p>

        {LOOM_URL ? (
          <div className="mt-10 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <iframe
              src={LOOM_URL}
              title="VIRLUX product demo"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <p className="text-slate-400">
              A recorded product walkthrough will appear here soon. Book a live demo below or open the dashboard to
              explore send, approvals, and payment history.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Register free on the live app, or use the demo account on staging.
            </p>
          </div>
        )}

        <ol className="mt-12 space-y-4 text-sm text-slate-300">
          {PUBLIC_COPY.howItWorks.map((step) => (
            <li key={step.step} className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="font-mono text-blue-400">{step.step}</span>
              <div>
                <p className="font-medium text-white">{step.title}</p>
                <p className="mt-1 text-slate-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={APP_URL} className="btn-primary">
            {PUBLIC_COPY.ctaPrimary}
          </Link>
          <BookDemoLink className="btn-secondary" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
