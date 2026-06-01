import { config } from "../../lib/config";
import { directSettlementExecutor } from "./direct-executor";
import { partnerSettlementExecutor } from "./partner-executor";
import { disabledSettlementExecutor } from "./disabled-executor";
import type { SettlementExecutor } from "./types";

export * from "./types";
export { applyPartnerSettlement, markSubmittedToPartner } from "./partner-result";
export { sandboxSettleTransaction, scheduleSandboxSettlement } from "./sandbox-executor";

export function getSettlementExecutor(): SettlementExecutor {
  switch (config.settlementMode) {
    case "sandbox":
    case "direct":
      return directSettlementExecutor;
    case "partner":
      return partnerSettlementExecutor;
    case "disabled":
      return disabledSettlementExecutor;
    default:
      return disabledSettlementExecutor;
  }
}

export function scheduleSettlement(txId: string) {
  const executor = getSettlementExecutor();
  setTimeout(async () => {
    try {
      await executor.submitInstruction(txId);
    } catch (e) {
      // logged by caller paths
    }
  }, 2500);
}
