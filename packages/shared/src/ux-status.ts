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

export const KYC_STATUS_LABELS: Record<string, string> = {
  pending: "Not submitted",
  in_review: "Under review",
  approved: "Verified",
  rejected: "Needs update",
};

export const DEPOSIT_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting transfer",
  completed: "Funds added",
  cancelled: "Cancelled",
};

export function formatKycStatus(status: string): string {
  return KYC_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatDepositStatus(status: string): string {
  return DEPOSIT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

/** Human-readable audit log actions for finance teams */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.register": "Account created",
  "kyc.submitted": "Verification submitted",
  "kyc.approved": "Verification approved",
  "kyc.rejected": "Verification rejected",
  "deposit.interac.initiated": "Interac deposit started",
  "deposit.interac.confirmed": "Interac deposit confirmed",
  "transaction.created": "Payment created",
  "transaction.approved": "Payment approved",
  "transaction.rejected": "Payment rejected",
  "transaction.cancelled": "Payment cancelled",
  "transaction.instruction.sent": "Payment sent for processing",
  "partner.created": "Partner configured",
};

export function formatAuditAction(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/\./g, " · ").replace(/_/g, " ");
}
