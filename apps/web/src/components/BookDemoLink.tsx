import { COMPANY, PUBLIC_COPY } from "@virlux/shared";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

/** Book-a-demo CTA — Calendly/HubSpot when NEXT_PUBLIC_BOOK_DEMO_URL is set; mailto fallback. */
export function BookDemoLink({ className = "btn-secondary", children }: Props) {
  const calendly = process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim();
  const label = children ?? PUBLIC_COPY.ctaDemo;

  if (calendly) {
    return (
      <a href={calendly} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <a
      href={`mailto:${COMPANY.email}?subject=VIRLUX%20demo%20request`}
      className={className}
    >
      {label}
    </a>
  );
}
