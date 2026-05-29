# FINTRAC record retention policy (draft)

**Entity:** Virlux Inc.  
**Status:** Draft — align with counsel review  
**Minimum retention:** 5 years from last transaction or account closure

---

## Records retained

| Category | System | Retention |
|----------|--------|-----------|
| KYC/KYB submissions | PostgreSQL `KycSubmission` | 5+ years |
| Transactions & quotes | PostgreSQL `Transaction`, `Quote` | 5+ years |
| Ledger entries | PostgreSQL `LedgerEntry` | 5+ years |
| Audit log | PostgreSQL `AuditLog` | 5+ years |
| Interac deposit intents | PostgreSQL `PaymentIntent` | 5+ years |
| Auth sessions | `RefreshToken` (revoked/expired) | Until purge policy TBD |

---

## Access & export

- Org owners/admins: dashboard audit + transaction history
- Compliance export: `GET /api/audit` (org-scoped) — extend for regulatory export if required
- Backups: Railway Postgres automated backups (configure retention on deploy)

---

## Deletion

- No hard delete of financial records during retention period
- Account closure: mark inactive; retain records per table above
- PIPEDA erasure requests: subject to legal retention exceptions — counsel to confirm

---

## Review

Annual policy review or upon MSB registration / product scope change.
