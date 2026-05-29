import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import { AppError } from "../lib/errors";

const mockTx = {
  wallet: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  ledgerEntry: { create: vi.fn(), findFirst: vi.fn() },
};

vi.mock("../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    wallet: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { debit, credit } from "./ledger";

describe("ledger service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTx.ledgerEntry.findFirst.mockResolvedValue(null);
    mockTx.wallet.upsert.mockResolvedValue({ id: "w1", userId: "u1" });
  });

  it("debit rejects when balance is insufficient", async () => {
    mockTx.wallet.updateMany.mockResolvedValue({ count: 0 });

    await expect(debit("u1", "CAD", 50, "tx", "ref1")).rejects.toMatchObject({
      code: "INSUFFICIENT_FUNDS",
    } satisfies Partial<AppError>);
  });

  it("credit increases balance and writes ledger entry", async () => {
    mockTx.wallet.update.mockResolvedValue({});
    mockTx.wallet.findUniqueOrThrow.mockResolvedValue({
      id: "w1",
      userId: "u1",
      cadBalance: new Decimal(150),
      usdBalance: new Decimal(0),
      usdcBalance: new Decimal(0),
    });

    const wallet = await credit("u1", "CAD", 50, "deposit", "dep1", "test credit");
    expect(mockTx.ledgerEntry.create).toHaveBeenCalledOnce();
    expect(wallet.cadBalance.toString()).toBe("150");
  });
});
