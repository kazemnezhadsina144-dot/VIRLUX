"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { CLIENT_COPY } from "@virlux/shared";
import overviewPng from "../../public/screenshots/overview.png";
import sendPng from "../../public/screenshots/send.png";
import paymentsPng from "../../public/screenshots/payments.png";
import overviewSvg from "../../public/screenshots/overview.svg";
import sendSvg from "../../public/screenshots/send.svg";
import paymentsSvg from "../../public/screenshots/payments.svg";

const SLIDES = [
  { png: overviewPng, svg: overviewSvg, alt: "Dashboard overview" },
  { png: sendPng, svg: sendSvg, alt: "Send payment" },
  { png: paymentsPng, svg: paymentsSvg, alt: "Payments list" },
] as const;

function ScreenshotSlide({
  png,
  svg,
  alt,
  priority,
  className,
}: {
  png: StaticImageData;
  svg: StaticImageData;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [src, setSrc] = useState<StaticImageData>(png);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-virlux-surface shadow-2xl ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={720}
        className="h-auto w-full"
        priority={priority}
        onError={() => {
          if (src !== svg) setSrc(svg);
        }}
      />
    </div>
  );
}

/** Product section — bundled PNGs from capture script, SVG fallback on load error */
export function ProductShowcase() {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <ScreenshotSlide {...SLIDES[0]} priority />
        <div className="grid gap-4 sm:grid-cols-2">
          <ScreenshotSlide {...SLIDES[1]} />
          <ScreenshotSlide {...SLIDES[2]} />
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">{CLIENT_COPY.productPreviewCaption}</p>
    </div>
  );
}

/** @deprecated Use ProductShowcase */
export function ProductScreenshotGallery() {
  return <ProductShowcase />;
}
