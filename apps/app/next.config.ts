import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@virlux/shared"],
  // Auth cookies: Route Handler at app/api/[...path]/route.ts forwards Set-Cookie.
  // Other /api paths still use rewrite fallback if needed.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API}/api/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
