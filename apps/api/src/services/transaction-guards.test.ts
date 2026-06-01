import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockUserFindMany = vi.fn();
const mockTransactionFindMany = vi.fn();
const mockPaymentIntentCount = vi.fn();
const mockOrganizationFindUnique = vi.fn();

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
    },
    organization: {
      findUnique: (...args: unknown[]) => mockOrganizationFindUnique(...args),
    },
    transaction: { findMany: (...args: unknown[]) => mockTransactionFindMany(...args) },
    paymentIntent: { count: (...args: unknown[]) => mockPaymentIntentCount(...args) },
  },
}));

vi.mock("../lib/config", () => ({
  config: { requirePartnerDeposit: true },
}));

vi.mock("./rates", () => ({
  toCadEquivalent: vi.fn(async (amount: number, currency: string) =>
    currency === "USD" ? amount * 1.36 : amount
  ),
}));

import { assertPilotCorridor, assertPartnerAttestedFunding, assertPilotVolumeCap } from "./transaction-guards";

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

  describe("assertPilotVolumeCap", () => {
    it("skips when org has no cap", async () => {
      mockUserFindUnique.mockResolvedValue({
        organizationId: "org1",
        organization: { pilotVolumeCapCad: null },
      });
      await expect(assertPilotVolumeCap("u1", 1000)).resolves.toBeUndefined();
    });

    it("rejects when 30-day usage plus new amount exceeds cap", async () => {
      mockUserFindUnique.mockResolvedValue({
        organizationId: "org1",
        organization: { id: "org1", pilotVolumeCapCad: 50000 },
      });
      mockUserFindMany.mockResolvedValue([{ id: "u1" }]);
      mockTransactionFindMany.mockResolvedValue([{ amountIn: 49000, fromCurrency: "CAD" }]);
      await expect(assertPilotVolumeCap("u1", 2000)).rejects.toMatchObject({ code: "PILOT_VOLUME_EXCEEDED" });
    });

    it("passes when under cap", async () => {
      mockUserFindUnique.mockResolvedValue({
        organizationId: "org1",
        organization: { id: "org1", pilotVolumeCapCad: 50000 },
      });
      mockUserFindMany.mockResolvedValue([{ id: "u1" }]);
      mockTransactionFindMany.mockResolvedValue([{ amountIn: 1000, fromCurrency: "CAD" }]);
      await expect(assertPilotVolumeCap("u1", 500)).resolves.toBeUndefined();
    });
  });
});
