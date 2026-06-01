"use client";

import { useEffect } from "react";

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
