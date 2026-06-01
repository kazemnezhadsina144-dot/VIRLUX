import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockPaymentIntentCount = vi.fn();

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    paymentIntent: { count: (...args: unknown[]) => mockPaymentIntentCount(...args) },
  },
}));

vi.mock("../lib/config", () => ({
  config: { requirePartnerDeposit: true },
}));

import { assertPilotCorridor, assertPartnerAttestedFunding } from "./transaction-guards";

describe("transaction-guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("assertPilotCorridor", () => {
    it("allows any country when org has no pilot lock", async () => {
      mockUserFindUnique.mockResolvedValue({ organization: { pilotCorridor: null } });
      await expect(assertPilotCorridor("u1", "CA")).resolves.toBeUndefined();
    });

    it("rejects mismatched corridor when org locked to PH", async () => {
      mockUserFindUnique.mockResolvedValue({ organization: { pilotCorridor: "PH" } });
      await expect(assertPilotCorridor("u1", "US")).rejects.toMatchObject({ code: "CORRIDOR_LOCKED" });
    });

    it("allows matching corridor when org locked to US", async () => {
      mockUserFindUnique.mockResolvedValue({ organization: { pilotCorridor: "US" } });
      await expect(assertPilotCorridor("u1", "United States")).resolves.toBeUndefined();
    });

    it("requires recipient country when corridor is locked", async () => {
      mockUserFindUnique.mockResolvedValue({ organization: { pilotCorridor: "PH" } });
      await expect(assertPilotCorridor("u1", "")).rejects.toMatchObject({ code: "CORRIDOR_LOCKED" });
    });
  });

  describe("assertPartnerAttestedFunding", () => {
    it("blocks send when no completed deposit exists", async () => {
      mockPaymentIntentCount.mockResolvedValue(0);
      await expect(assertPartnerAttestedFunding("u1")).rejects.toMatchObject({ code: "DEPOSIT_REQUIRED" });
    });

    it("passes when at least one completed deposit exists", async () => {
      mockPaymentIntentCount.mockResolvedValue(1);
      await expect(assertPartnerAttestedFunding("u1")).resolves.toBeUndefined();
    });
  });
});
