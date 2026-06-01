/** SME-facing status labels — hide internal orchestration states (SYSTEM.md §5.4) */

export const SME_TX_STATUS = {
  pending: "Pending",
  awaiting_approval: "Pending approval",
  processing: "Sent",
  submitted_to_partner: "Sent",
  confirmed: "Settled",
  failed: "Failed",
  cancelled: "Cancelled",
} as const;

export type InternalTxStatus = keyof typeof SME_TX_STATUS;

export function formatSmeTxStatus(status: string): string {
  return SME_TX_STATUS[status as InternalTxStatus] ?? "Pending";
}
