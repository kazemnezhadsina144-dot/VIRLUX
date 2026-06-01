export type PartnerSettlementStatus = "complete" | "failed";

export interface PartnerSettlementPayload {
  virluxTransactionId: string;
  partnerId: string;
  status: PartnerSettlementStatus;
  partnerSettlementId: string;
  txHash?: string;
  platformFeeCad?: number;
  partnerFeeCad?: number;
  failureReason?: string;
}

export interface SettlementExecutor {
  submitInstruction(txId: string): Promise<void>;
}

export interface InstructionPayload {
  virluxTransactionId: string;
  organizationId: string | null;
  partnerId: string | null;
  amountIn: string;
  fromCurrency: string;
  amountOut: string;
  toStablecoin: string;
  network: string;
  recipientWallet?: string | null;
  recipientCountry?: string | null;
  recipientName?: string | null;
  feeAmount: string;
  idempotencyKey: string;
}
