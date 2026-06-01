import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockUpdateMany = vi.fn();
const mockAuditCreate = vi.fn();
const mockFindUniqueOrThrow = vi.fn();

vi.mock("../../lib/prisma", () => ({
  prisma: {
    transaction: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUniqueOrThrow: (...args: unknown[]) => mockFindUniqueOrThrow(...args),
    },
    auditLog: { create: (...args: unknown[]) => mockAuditCreate(...args) },
  },
}));

vi.mock("../../lib/config", () => ({
  config: { settlementMode: "partner" },
}));

import { markSubmittedToPartner } from "./partner-result";

describe("markSubmittedToPartner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transitions processing → submitted_to_partner", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "tx-1", status: "processing" });
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      id: "tx-1",
      status: "submitted_to_partner",
    });

    const result = await markSubmittedToPartner("tx-1", "admin-1", "pilot ops");

    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tx-1", status: "processing" },
        data: expect.objectContaining({ status: "submitted_to_partner" }),
      })
    );
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "transaction.submitted_to_partner.manual",
        }),
      })
    );
    expect(result.status).toBe("submitted_to_partner");
  });

  it("rejects when transaction is not in processing", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "tx-1", status: "confirmed" });
    await expect(markSubmittedToPartner("tx-1", "admin-1")).rejects.toMatchObject({
      code: "INVALID_STATUS",
    });
  });

  it("returns conflict when already submitted by concurrent update", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "tx-1", status: "processing" });
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });
    await expect(markSubmittedToPartner("tx-1", "admin-1")).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});
