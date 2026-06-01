import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { config } from "../lib/config";
import { assertSameOrg, orgMemberIds } from "../lib/org";
import { notifyKycUpdate } from "../telegram/handlers";
import { emitPartnerWebhook } from "./partner-webhooks";

export async function submitKyc(
  userId: string,
  input: { documentType: string; documentNumber: string; country?: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  if (user.kycStatus === "approved") {
    throw new AppError(400, "KYC already approved", "KYC_ALREADY_APPROVED");
  }

  const submission = await prisma.kycSubmission.create({
    data: {
      userId,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      country: input.country ?? "CA",
      status: "in_review",
    },
  });

  await prisma.user.update({ where: { id: userId }, data: { kycStatus: "in_review" } });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "kyc.submitted",
      metadata: { submissionId: submission.id, documentType: input.documentType },
    },
  });

  if (config.autoSettle) {
    setTimeout(() => approveKyc(submission.id).catch(() => {}), 3000);
  }

  return submission;
}

export async function approveKyc(submissionId: string, notes?: string) {
  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) throw new AppError(404, "Submission not found");

  await prisma.kycSubmission.update({
    where: { id: submissionId },
    data: { status: "approved", reviewedAt: new Date(), reviewNotes: notes },
  });

  await prisma.user.update({
    where: { id: submission.userId },
    data: { kycStatus: "approved" },
  });

  const wallet = await prisma.wallet.findUnique({ where: { userId: submission.userId } });
  if (wallet && !wallet.address) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { address: `0x${crypto.randomBytes(20).toString("hex")}` },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: submission.userId,
      action: "kyc.approved",
      metadata: { submissionId },
    },
  });

  notifyKycUpdate(submission.userId, "approved").catch(() => {});
  emitPartnerWebhook(submission.userId, "kyc.approved", {
    submissionId,
    userId: submission.userId,
  }).catch(() => {});
}

export async function rejectKyc(submissionId: string, notes: string) {
  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) throw new AppError(404, "Submission not found");

  await prisma.kycSubmission.update({
    where: { id: submissionId },
    data: { status: "rejected", reviewedAt: new Date(), reviewNotes: notes },
  });

  await prisma.user.update({
    where: { id: submission.userId },
    data: { kycStatus: "rejected" },
  });

  notifyKycUpdate(submission.userId, "rejected").catch(() => {});
  emitPartnerWebhook(submission.userId, "kyc.rejected", {
    submissionId,
    userId: submission.userId,
    notes,
  }).catch(() => {});
  return submission;
}

export async function getKycStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true, fullName: true, email: true },
  });
  const submissions = await prisma.kycSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return { ...user, submissions };
}

export async function listOrgKycQueue(reviewerId: string) {
  const memberIds = await orgMemberIds(reviewerId);
  if (!memberIds) return [];

  const submissions = await prisma.kycSubmission.findMany({
    where: { userId: { in: memberIds }, status: "in_review" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, fullName: true, organizationId: true } },
    },
  });

  return submissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    userEmail: s.user.email,
    userName: s.user.fullName,
    documentType: s.documentType,
    documentNumberMasked: maskDocNumber(s.documentNumber),
    country: s.country,
    status: s.status,
    createdAt: s.createdAt,
  }));
}

function maskDocNumber(num: string) {
  if (num.length <= 4) return "****";
  return `${"*".repeat(Math.min(num.length - 4, 8))}${num.slice(-4)}`;
}

export async function approveKycAsReviewer(submissionId: string, reviewerId: string, notes?: string) {
  const submission = await prisma.kycSubmission.findUnique({
    where: { id: submissionId },
    include: { user: { select: { id: true } } },
  });
  if (!submission || submission.status !== "in_review") {
    throw new AppError(404, "Submission not found or not in review", "NOT_FOUND");
  }
  await assertSameOrg(reviewerId, submission.userId);

  await approveKyc(submissionId, notes);

  await prisma.auditLog.create({
    data: {
      userId: reviewerId,
      action: "kyc.review.approved",
      metadata: { submissionId, targetUserId: submission.userId, notes },
    },
  });

  return prisma.kycSubmission.findUniqueOrThrow({ where: { id: submissionId } });
}

export async function rejectKycAsReviewer(submissionId: string, reviewerId: string, notes: string) {
  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.status !== "in_review") {
    throw new AppError(404, "Submission not found or not in review", "NOT_FOUND");
  }
  await assertSameOrg(reviewerId, submission.userId);

  const result = await rejectKyc(submissionId, notes);

  await prisma.auditLog.create({
    data: {
      userId: reviewerId,
      action: "kyc.review.rejected",
      metadata: { submissionId, targetUserId: submission.userId, notes },
    },
  });

  return result;
}
