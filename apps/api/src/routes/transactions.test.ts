import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../middleware/auth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { auth?: { userId: string; role: string } }).auth = {
      userId: "user-1",
      role: "owner",
    };
    next();
  },
  attachFreshUser: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  requireRole: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock("../services/transactions", () => ({
  createTransaction: vi.fn(async () => ({ id: "tx-1", status: "pending" })),
}));

import transactionsRoutes from "./transactions";

describe("send / transactions routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/transactions", transactionsRoutes);

  it("rejects send without quoteId", async () => {
    const res = await request(app).post("/api/transactions").send({ idempotencyKey: "key-12345678" });
    expect(res.status).toBe(400);
  });

  it("accepts valid send payload", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({
        quoteId: "quote-abc",
        recipientCountry: "US",
        memo: "invoice 42",
        idempotencyKey: "key-12345678",
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("tx-1");
  });
});
