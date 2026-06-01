/** CSS dashboard preview for marketing — no screenshots required */
export function ProductPreview() {
  return (
    <div className="glass-card overflow-hidden p-1 shadow-card">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/30 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-500/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs text-slate-500">app.virlux.com</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-xs text-slate-500">CAD balance</p>
          <p className="mt-1 text-xl font-bold text-white">$10,000</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-1 text-sm font-medium text-emerald-400">Verified · Ready to send</p>
        </div>
        <div className="sm:col-span-2 rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Recent payment</span>
            <span className="badge-green text-xs">Settled</span>
          </div>
          <p className="mt-2 font-medium text-white">$500 CAD → international supplier</p>
          <p className="mt-1 text-xs text-slate-500">1% fee shown upfront · Approved by finance team</p>
        </div>
      </div>
    </div>
  );
}
