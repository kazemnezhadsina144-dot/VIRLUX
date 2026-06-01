import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { credit } from "./ledger";

export function isDemoFundEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_FUND_ENABLED === "true";
}

export async function fundDemoWallet(userId: string) {
  if (!isDemoFundEnabled()) {
    throw new AppError(403, "Demo funding is not enabled on this environment", "DEMO_FUND_DISABLED");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
  if (!user?.wallet) throw new AppError(404, "Wallet not found");

  await credit(userId, "CAD", 10000, "demo_fund", `demo-${Date.now()}`, "Staging demo balance top-up");

  return prisma.wallet.findUnique({ where: { userId } });
}
