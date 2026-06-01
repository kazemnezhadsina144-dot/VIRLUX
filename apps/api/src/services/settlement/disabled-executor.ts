import { logger } from "../../lib/logger";
import type { SettlementExecutor } from "./types";

/** Production-safe mode — txs stay in processing until partner webhook or platform ops */
export const disabledSettlementExecutor: SettlementExecutor = {
  async submitInstruction(txId: string) {
    logger.warn("Settlement disabled — transaction awaiting manual partner integration", { txId });
  },
};
