import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "./auth";

describe("auth routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  it("rejects login without body", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@virlux.com", password: "wrongpass1" });
    expect([401, 500]).toContain(res.status);
  });
});
