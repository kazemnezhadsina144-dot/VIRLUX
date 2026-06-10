export type NetworkId = "ethereum" | "polygon" | "solana";
export type FiatCurrency = "CAD" | "USD";
export type Stablecoin = "USDC" | "USDT";
export type UserRole = "owner" | "admin" | "approver" | "viewer";

export interface QuoteRequest {
  amount: number;
  fromCurrency: FiatCurrency;
  toStablecoin: Stablecoin;
  network: NetworkId;
}

export interface QuoteResponse {
  amountIn: number;
  fromCurrency: FiatCurrency;
  toStablecoin: Stablecoin;
  network: NetworkId;
  midMarketRate: number;
  virluxFeePercent: number;
  virluxFeeAmount: number;
  estimatedGasUsd: number;
  amountOut: number;
  rateProviders: string[];
  disclaimer: string;
  expiresAt: string;
}

export interface TransactionStatus {
  id: string;
  status: "pending" | "awaiting_approval" | "processing" | "confirmed" | "failed";
  txHash?: string;
  createdAt: string;
}
