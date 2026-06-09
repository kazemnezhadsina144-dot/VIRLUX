import { Router } from "express";
import {
  COMPANY,
  COMPLIANCE,
  COVERAGE,
  NETWORKS,
  PRICING,
  SUPPORTED_COUNTRIES,
  USE_CASES,
  FAQ_ITEMS,
} from "@virlux/shared";

const router = Router();

router.get("/config", (_req, res) => {
  res.json({
    company: COMPANY,
    compliance: COMPLIANCE,
    coverage: COVERAGE,
    pricing: PRICING,
    networks: NETWORKS,
    countries: SUPPORTED_COUNTRIES,
    useCases: USE_CASES,
    faq: FAQ_ITEMS,
    approvalThresholdCad: Number(process.env.APPROVAL_THRESHOLD ?? 5000),
    demoApprovalThresholdCad: process.env.DEMO_APPROVAL_THRESHOLD
      ? Number(process.env.DEMO_APPROVAL_THRESHOLD)
      : undefined,
  });
});

export default router;
