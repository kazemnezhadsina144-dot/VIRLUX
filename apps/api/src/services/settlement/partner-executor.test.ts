import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockUpdateMany = vi.fn();
const mockAuditCreate = vi.fn();
const mockEmitPartnerWebhook = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    transaction: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
    auditLog: { create: (...args: unknown[]) => mockAuditCreate(...args) },
  },
}));

vi.mock("../../lib/config", () => ({
  config: { settlementMode: "partner" },
}));

vi.mock("../partner-webhooks", () => ({
  emitPartnerWebhook: (...args: unknown[]) => mockEmitPartnerWebhook(...args),
}));

vi.mock("../../lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { partnerSettlementExecutor } from "./partner-executor";

describe("partnerSettlementExecutor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits transaction.instruction webhook when submitting instruction", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "tx-1",
      status: "processing",
      userId: "user-1",
      amountIn: { toString: () => "1000" },
      fromCurrency: "CAD",
      amountOut: { toString: () => "700" },
      toStablecoin: "USDC",
      network: "polygon",
      recipientWallet: "0xabc",
      recipientCountry: "PH",
      recipientName: "Supplier",
      feeAmount: { toString: () => "10" },
      user: {
        organizationId: "org-1",
        organization: { partnerId: "partner-1", partner: { id: "partner-1" } },
      },
    });
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });

    await partnerSettlementExecutor.submitInstruction("tx-1");

    expect(mockEmitPartnerWebhook).toHaveBeenCalledWith(
      "user-1",
      "transaction.instruction",
      expect.objectContaining({
        virluxTransactionId: "tx-1",
        partnerId: "partner-1",
      })
    );
  });

  it("no-ops when transaction is not in processing", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "tx-1", status: "pending" });
    await partnerSettlementExecutor.submitInstruction("tx-1");
    expect(mockEmitPartnerWebhook).not.toHaveBeenCalled();
  });
});
