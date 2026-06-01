/** Privacy-safe analytics — no PII in props */
export function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const w = window as Window & { plausible?: (n: string, o?: { props?: Record<string, string> }) => void };
  w.plausible?.(name, props ? { props } : undefined);
}
