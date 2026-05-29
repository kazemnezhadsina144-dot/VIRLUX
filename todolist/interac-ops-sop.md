# Interac ops SOP (manual CAD on-ramp)

**Owner:** VIRLUX ops / founder  
**Applies to:** Production and staging when `AUTO_SETTLE=false`  
**Last updated:** 2026-05-29

---

## Overview

Customer initiates deposit in dashboard → receives unique reference `VRLX-...` → sends Interac e-Transfer to VIRLUX business account → ops verifies in bank → admin clicks **Confirm received** → CAD credited to ledger.

---

## Step-by-step

### 1. Customer initiates (dashboard)

- Role required: **owner**, **admin**, or **approver**
- KYC must be **approved**
- System creates `PaymentIntent` with status `pending` and reference e.g. `VRLX-M123ABC-A1B2`

### 2. Customer sends Interac

Customer must include **exact reference** in e-Transfer message/memo.  
**Policy:** Amount must match exactly unless ops approves partial/overpayment in writing.

### 3. Ops monitors bank

Check designated business Interac inbox/account:

| Check | Action if fail |
|-------|----------------|
| Reference matches pending intent | Hold — contact customer |
| Amount matches | Hold or partial credit per policy |
| Sender name plausible vs KYC business | Flag for compliance review |
| Duplicate reference | Do not double-credit — investigate |

### 4. Admin confirms (dashboard)

1. Log in as org **owner** or **admin**  
2. **Deposits** → **Pending Interac confirmations**  
3. Verify row matches bank receipt  
4. Click **Confirm received**  

API: `POST /api/wallet/deposits/:id/confirm`  
Audit: `deposit.interac.confirmed`  
Telegram: customer notified if linked  

### 5. Post-confirm

- Intent status → `completed`  
- CAD credited via ledger (`credit`)  
- Customer can quote and send  

---

## SLAs (pilot)

| Metric | Target |
|--------|--------|
| Confirm same business day (before 4pm ET) | 95% |
| Response to mismatch | Within 1 business day |

---

## Escalation

| Scenario | Action |
|----------|--------|
| Wrong reference, correct amount | Contact customer; manual match or refund via bank |
| No matching intent | Do not credit; refund sender if identifiable |
| Suspected fraud | Freeze account; compliance review |
| Double confirm attempt | API returns 409 — no double credit |

---

## Production automation (future)

Replace manual confirm with bank webhook/API when volume exceeds ~20 deposits/week or ops SLA breaks. Until then, manual SOP is **intentional** for pilots.

---

## Related

- [Pilot LOI](./pilot-loi-template.md)  
- [Launch blockers](./launch-blockers.md)  
- Code: `apps/api/src/services/deposits.ts`
