import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_SECURITY_HEADERS } from "@virlux/shared";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  transpilePackages: ["@virlux/shared"],
  async headers() {
    return [{ source: "/:path*", headers: [...WEB_SECURITY_HEADERS] }];
  },
};

export default nextConfig;
