# Counsel review brief — VIRLUX Terms & Privacy

**For:** Legal counsel (Ontario / Canadian fintech)  
**Status:** Ready for review — drafts live at `/terms` and `/privacy`  
**Product:** B2B cross-border payments — Interac CAD on-ramp, team approvals, stablecoin settlement (Circle)

---

## Documents to review

| Doc | URL (local) | File |
|-----|-------------|------|
| Terms of Service | http://localhost:3100/terms | `apps/web/src/app/terms/page.tsx` |
| Privacy Policy | http://localhost:3100/privacy | `apps/web/src/app/privacy/page.tsx` |
| Marketing copy | http://localhost:3100 | `apps/web/src/app/page.tsx` |

---

## Key questions for counsel

### MSB / FINTRAC

1. Does Virlux Inc.'s current product scope require MSB registration before pilot customers?
2. What activities trigger reporting (LCTR, EFT, STR)? At what thresholds?
3. Is manual Interac confirm (ops marks deposit received) acceptable for pilot phase?
4. What KYC/KYB standard is required for business customers (FINTRAC PCMLTFR)?

### Terms of Service

5. Is limitation of liability language (Section 8) enforceable for B2B in Ontario?
6. Settlement risk / refund on Circle failure — sufficient disclosure?
7. Interac reference requirement — adequate to limit liability for misdirected transfers?

### Privacy (PIPEDA)

8. Is retention period (5 years post-close) sufficient for financial records?
9. Subprocessor list (Railway, Vercel, Circle, Telegram) — adequate disclosure?
10. Cross-border data transfer (US hosting) — consent and safeguards required?

### Marketing

11. Confirm no MSB/FINTRAC claims until registered (currently `fintracMsbClaim: false` in code).
12. "17 corridors" and "1% fee" — any disclosure requirements?

---

## Product facts (for context)

- **Entity:** Virlux Inc., Oshawa ON
- **No demo account in production** — seed dev-only
- **Maker-checker** approvals for payments above threshold
- **AUTO_SETTLE=false** in production (no simulated money movement)
- **Stablecoin:** Circle sandbox first; production wallet TBD after counsel

---

## Deliverable from counsel

- [ ] Redlined Terms + Privacy
- [ ] MSB registration yes/no/maybe with timeline
- [ ] Pilot LOI compatibility review (`todolist/pilot-loi-template.md`)
- [ ] Written approval before first pilot accepts real CAD

**Contact for product questions:** contact@virlux.com
