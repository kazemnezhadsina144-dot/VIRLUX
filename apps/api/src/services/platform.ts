import { prisma } from "../lib/prisma";
import { applyPartnerSettlement, markSubmittedToPartner } from "./settlement";
import { AppError } from "../lib/errors";
import { completeDeposit } from "./deposits";
import { approveKyc, rejectKyc } from "./kyc";
import { toCadEquivalent } from "./rates";

function maskDocNumber(num: string) {
  if (num.length <= 4) return "****";
  return `${"*".repeat(Math.min(num.length - 4, 8))}${num.slice(-4)}`;
}

export async function listPlatformKycQueue() {
  const submissions = await prisma.kycSubmission.findMany({
    where: { status: "in_review" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          organizationId: true,
          organization: { select: { id: true, name: true, partnerId: true, partner: { select: { id: true, legalName: true } } } },
        },
      },
    },
  });

  return submissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    userEmail: s.user.email,
    userName: s.user.fullName,
    organizationId: s.user.organizationId,
    organizationName: s.user.organization?.name,
    partnerId: s.user.organization?.partnerId,
    partnerName: s.user.organization?.partner?.legalName,
    documentType: s.documentType,
    documentNumberMasked: maskDocNumber(s.documentNumber),
    country: s.country,
    status: s.status,
    createdAt: s.createdAt,
  }));
}

export async function listPlatformPendingDeposits() {
  const intents = await prisma.paymentIntent.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          organization: { select: { id: true, name: true, partnerId: true, partner: { select: { id: true, legalName: true } } } },
        },
      },
    },
  });

  return intents.map((i) => ({
    id: i.id,
    userId: i.userId,
    userEmail: i.user.email,
    userName: i.user.fullName,
    organizationName: i.user.organization?.name,
    partnerId: i.user.organization?.partnerId,
    partnerName: i.user.organization?.partner?.legalName,
    amountCad: i.amountCad,
    reference: i.reference,
    status: i.status,
    createdAt: i.createdAt,
  }));
}

export async function confirmDepositAsPlatform(intentId: string, adminId: string) {
  const intent = await prisma.paymentIntent.findUnique({ where: { id: intentId } });
  if (!intent) throw new AppError(404, "Deposit not found");
  if (intent.status !== "pending") {
    throw new AppError(409, "Deposit is not pending", "INVALID_STATUS");
  }

  const completed = await completeDeposit(intentId);

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "deposit.interac.confirmed.platform",
      metadata: { paymentIntentId: intentId, targetUserId: intent.userId, reference: intent.reference },
    },
  });

  return completed;
}

export async function approveKycAsPlatform(submissionId: string, adminId: string, notes?: string) {
  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.status !== "in_review") {
    throw new AppError(404, "Submission not found or not in review", "NOT_FOUND");
  }

  await approveKyc(submissionId, notes);

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "kyc.review.approved.platform",
      metadata: { submissionId, targetUserId: submission.userId, notes },
    },
  });

  return prisma.kycSubmission.findUniqueOrThrow({ where: { id: submissionId } });
}

export async function rejectKycAsPlatform(submissionId: string, adminId: string, notes: string) {
  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.status !== "in_review") {
    throw new AppError(404, "Submission not found or not in review", "NOT_FOUND");
  }

  const result = await rejectKyc(submissionId, notes);

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "kyc.review.rejected.platform",
      metadata: { submissionId, targetUserId: submission.userId, notes },
    },
  });

  return result;
}

export async function listPartners() {
  return prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { organizations: true } } },
  });
}

export async function getPartnerOrganizations(partnerId: string) {
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) throw new AppError(404, "Partner not found");

  return prisma.organization.findMany({
    where: { partnerId },
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function exportFintracCsv(from: Date, to: Date, partnerId?: string, adminId?: string) {
  let orgIds: string[] | undefined;
  if (partnerId) {
    const orgs = await prisma.organization.findMany({
      where: { partnerId },
      select: { id: true },
    });
    orgIds = orgs.map((o) => o.id);
    if (orgIds.length === 0) {
      return "record_type,id,user_email,organization,action,amount_cad,currency,status,created_at\n";
    }
  }

  if (adminId) {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "platform.fintrac.export",
        metadata: { from: from.toISOString(), to: to.toISOString(), partnerId: partnerId ?? null },
      },
    });
  }

  const userFilter = orgIds
    ? { organizationId: { in: orgIds } }
    : undefined;

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(userFilter ? { user: userFilter } : {}),
    },
    include: {
      user: {
        select: {
          email: true,
          organization: { select: { name: true, partner: { select: { legalName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const txWhere = {
    createdAt: { gte: from, lte: to },
    ...(userFilter ? { user: userFilter } : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where: txWhere,
    include: {
      user: {
        select: {
          email: true,
          organization: { select: { name: true, partner: { select: { legalName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const lines = ["record_type,id,user_email,organization,partner,action,amount_cad,currency,status,created_at"];

  for (const log of auditLogs) {
    lines.push(
      csvRow([
        "audit",
        log.id,
        log.user.email,
        log.user.organization?.name ?? "",
        log.user.organization?.partner?.legalName ?? "",
        log.action,
        "",
        "",
        "",
        log.createdAt.toISOString(),
      ])
    );
  }

  for (const tx of transactions) {
    const amountCad = await toCadEquivalent(Number(tx.amountIn), tx.fromCurrency as "CAD" | "USD");
    lines.push(
      csvRow([
        "transaction",
        tx.id,
        tx.user.email,
        tx.user.organization?.name ?? "",
        tx.user.organization?.partner?.legalName ?? "",
        "transaction",
        amountCad.toFixed(2),
        tx.fromCurrency,
        tx.status,
        tx.createdAt.toISOString(),
      ])
    );
  }

  return lines.join("\n") + "\n";
}

function csvRow(cells: string[]): string {
  return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
}

export async function processDepositWebhook(input: {
  reference: string;
  amountCad?: number;
  externalId?: string;
}) {
  const intent = await prisma.paymentIntent.findUnique({ where: { reference: input.reference } });
  if (!intent) throw new AppError(404, "No matching deposit reference", "NOT_FOUND");
  if (intent.status !== "pending") {
    throw new AppError(409, "Deposit already processed", "INVALID_STATUS");
  }
  if (input.amountCad !== undefined && Number(intent.amountCad) !== input.amountCad) {
    throw new AppError(400, "Amount mismatch", "AMOUNT_MISMATCH");
  }

  return completeDeposit(intent.id);
}

export async function markTransactionSubmittedPlatform(
  txId: string,
  adminId: string,
  reason?: string
) {
  return markSubmittedToPartner(txId, adminId, reason);
}

export async function markTransactionSettledPlatform(
  txId: string,
  adminId: string,
  input: {
    partnerSettlementId: string;
    txHash?: string;
    platformFeeCad?: number;
    partnerFeeCad?: number;
  }
) {
  const tx = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { user: { include: { organization: true } } },
  });
  if (!tx) throw new AppError(404, "Transaction not found", "NOT_FOUND");

  const partnerId = tx.user.organization?.partnerId;
  if (!partnerId) {
    throw new AppError(400, "Organization has no MSB partner assigned", "NO_PARTNER");
  }

  const confirmed = await applyPartnerSettlement({
    virluxTransactionId: txId,
    partnerId,
    status: "complete",
    partnerSettlementId: input.partnerSettlementId,
    txHash: input.txHash,
    platformFeeCad: input.platformFeeCad,
    partnerFeeCad: input.partnerFeeCad,
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "transaction.settled.platform",
      metadata: {
        transactionId: txId,
        partnerSettlementId: input.partnerSettlementId,
        reason: "manual_platform_ops",
      },
    },
  });

  return confirmed;
}

export async function listPlatformSubmittedTransactions() {
  return prisma.transaction.findMany({
    where: { status: "submitted_to_partner" },
    orderBy: { submittedToPartnerAt: "asc" },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          organization: { select: { name: true, partner: { select: { legalName: true } } } },
        },
      },
    },
    take: 100,
  });
}

export async function setOrganizationPilotCorridor(
  orgId: string,
  pilotCorridor: "PH" | "US" | null,
  adminId: string
) {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { pilotCorridor },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "organization.pilot_corridor.set",
      metadata: { organizationId: orgId, pilotCorridor },
    },
  });

  return org;
}
