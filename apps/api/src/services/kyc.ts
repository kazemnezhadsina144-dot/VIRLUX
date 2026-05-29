import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { config } from "../lib/config";
import { notifyKycUpdate } from "../telegram/handlers";

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
