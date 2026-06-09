/** Lightweight health — no Prisma import (serverless cold start) */
export default function handler(
  _req: unknown,
  res: {
    setHeader: (name: string, value: string) => void;
    status: (n: number) => { json: (b: object) => void };
  }
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.status(200).json({
    status: "ok",
    service: "virlux-api",
    version: "2.2.0",
  });
}
