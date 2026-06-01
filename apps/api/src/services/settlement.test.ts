import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const mockFindUnique = vi.fn();
const mockUpdateMany = vi.fn();
const mockFindUniqueOrThrow = vi.fn();
const mockAuditCreate = vi.fn();

vi.mock("../lib/prisma", () => ({
  prisma: {
    transaction: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUniqueOrThrow: (...args: unknown[]) => mockFindUniqueOrThrow(...args),
    },
    auditLog: {
      create: (...args: unknown[]) => mockAuditCreate(...args),
    },
    partner: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../lib/config", () => ({
  config: { settlementMode: "partner" },
}));

vi.mock("./partner-webhooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./partner-webhooks")>();
  return {
    ...actual,
    emitPartnerWebhook: vi.fn(),
  };
});

vi.mock("./transaction-failure", () => ({
  failTransaction: vi.fn(),
}));

import { verifyPartnerSettlementSignature } from "./partner-webhooks";
import { applyPartnerSettlement } from "./settlement/partner-result";
import { prisma } from "../lib/prisma";

describe("partner settlement webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifyPartnerSettlementSignature validates HMAC with partner secret", async () => {
    const secret = "test-partner-secret-min-16";
    const body = '{"partnerId":"p1","status":"complete"}';
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");

    vi.mocked(prisma.partner.findUnique).mockResolvedValue({
      id: "p1",
      webhookSecret: secret,
    } as never);

    const valid = await verifyPartnerSettlementSignature("p1", body, sig);
    expect(valid).toBe(true);
  });

  it("applyPartnerSettlement is idempotent when already confirmed", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "tx-1",
      status: "confirmed",
      user: { organization: { partnerId: "p1" } },
    });

    const result = await applyPartnerSettlement({
      virluxTransactionId: "tx-1",
      partnerId: "p1",
      status: "complete",
      partnerSettlementId: "ps-1",
    });

    expect(result.status).toBe("confirmed");
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("applyPartnerSettlement rejects partner mismatch", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "tx-1",
      status: "submitted_to_partner",
      user: { organization: { partnerId: "p-other" } },
    });

    await expect(
      applyPartnerSettlement({
        virluxTransactionId: "tx-1",
        partnerId: "p1",
        status: "complete",
        partnerSettlementId: "ps-1",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
