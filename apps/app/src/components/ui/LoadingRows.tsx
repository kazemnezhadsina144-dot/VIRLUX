export function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-2xl animate-pulse space-y-4">
      <div className="h-4 w-32 rounded bg-white/[0.06]" />
      <div className="h-8 w-48 rounded bg-white/[0.08]" />
      <div className="h-4 w-40 rounded bg-white/[0.04]" />
      <div className="mt-8 space-y-4 glass-panel p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
            <div className="h-4 w-24 rounded bg-white/[0.06]" />
            <div className="h-4 w-32 rounded bg-white/[0.08]" />
          </div>
        ))}
      </div>
    </div>
  );
}
