"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductPreview } from "./ProductPreview";

const SHOTS = [
  {
    png: "/screenshots/overview.png",
    svg: "/screenshots/overview.svg",
    alt: "VIRLUX dashboard overview with balance and recent payments",
  },
  {
    png: "/screenshots/send.png",
    svg: "/screenshots/send.svg",
    alt: "Send payment flow with upfront rate and fee",
  },
  {
    png: "/screenshots/payments.png",
    svg: "/screenshots/payments.svg",
    alt: "Payments list with status tracking",
  },
];

function ShotImage({ png, svg, alt }: { png: string; svg: string; alt: string }) {
  const [src, setSrc] = useState(png);
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={260}
      className="h-auto w-full"
      unoptimized
      onError={() => {
        if (src !== svg) setSrc(svg);
      }}
    />
  );
}

export function ProductScreenshotGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {SHOTS.map((shot) => (
        <div key={shot.svg} className="glass-card overflow-hidden">
          <ShotImage png={shot.png} svg={shot.svg} alt={shot.alt} />
        </div>
      ))}
      <p className="sm:col-span-3 text-center text-xs text-slate-500">
        Drop live PNGs as <code className="text-blue-400">overview.png</code>,{" "}
        <code className="text-blue-400">send.png</code>, <code className="text-blue-400">payments.png</code> in{" "}
        <code className="text-blue-400">public/screenshots/</code> — SVG placeholders show until then.
      </p>
    </div>
  );
}

/** Gallery when assets exist; otherwise CSS preview fallback */
export function ProductShowcase() {
  return (
    <div className="space-y-6">
      <ProductScreenshotGallery />
      <details className="text-sm text-slate-500">
        <summary className="cursor-pointer text-slate-400">Preview mock (fallback)</summary>
        <div className="mt-4 max-w-md">
          <ProductPreview />
        </div>
      </details>
    </div>
  );
}
