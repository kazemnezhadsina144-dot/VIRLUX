"use client";

import { COMPANY, PUBLIC_COPY } from "@virlux/shared";
import { trackEvent } from "./Analytics";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

/** Book-a-demo CTA — Calendly/HubSpot when NEXT_PUBLIC_BOOK_DEMO_URL is set; mailto fallback. */
export function BookDemoLink({ className = "btn-secondary", children }: Props) {
  const calendly = process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim();
  const label = children ?? PUBLIC_COPY.ctaDemo;

  function onClick() {
    trackEvent("demo_booked", { source: calendly ? "calendly" : "mailto" });
  }

  if (calendly) {
    return (
      <a
        href={calendly}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={`mailto:${COMPANY.email}?subject=VIRLUX%20demo%20request`}
      className={className}
      onClick={onClick}
    >
      {label}
    </a>
  );
}
