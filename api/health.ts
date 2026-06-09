/** Lightweight health — no Prisma import (serverless cold start) */
export default function handler(
  _req: unknown,
  res: { status: (n: number) => { json: (b: object) => void } }
) {
  res.status(200).json({
    status: "ok",
    service: "virlux-api",
    version: "2.2.0",
  });
}
