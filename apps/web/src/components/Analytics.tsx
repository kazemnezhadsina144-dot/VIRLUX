"use client";

import { useEffect } from "react";

/** Privacy-safe analytics — Plausible when NEXT_PUBLIC_ANALYTICS_DOMAIN is set */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN?.trim();
  if (!domain) return null;

  useEffect(() => {
    if (document.querySelector(`script[data-domain="${domain}"]`)) return;
    const s = document.createElement("script");
    s.defer = true;
    s.dataset.domain = domain;
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }, [domain]);

  return null;
}

export function trackEvent(name: string, props?: Record<string, string>) {
  const w = window as Window & { plausible?: (n: string, o?: { props?: Record<string, string> }) => void };
  w.plausible?.(name, props ? { props } : undefined);
}
