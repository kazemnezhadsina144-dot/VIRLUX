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
  PORTS,
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
    ports: PORTS,
  });
});

export default router;
