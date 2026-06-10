# Breach assessment — INC-009 (Supabase PostgREST exposure)

**Date assessed:** 2026-06-10  
**Project:** virlux-staging (`bueoakgiisvufxfbdvoa`)  
**Exposure window:** ~2026-06-08 (Supabase CRITICAL email) until RLS + REVOKE migrations applied  

## What was exposed (if anon key was used during window)

- `User.passwordHash`, email, phone  
- `RefreshToken.tokenHash`  
- KYC document numbers, team invite tokens, partner webhook secrets  
- Wallet / transaction metadata via PostgREST  

## Remediation applied

- RLS enabled on all 13 tables (`20250608000000_enable_rls`)  
- `REVOKE ALL` from anon/authenticated (`20250609000000_revoke_postgrest_grants`)  
- Explicit deny-all policies (`20250610000000_deny_postgrest_policies`)  
- PostgREST probe: `npm run verify:supabase-security`  
- Demo passwords rotated; staging sessions revoked  

## PIPEDA notification decision (founder sign-off)

| Question | Notes |
|----------|--------|
| Was personal information accessed by unauthorized parties? | **Unknown** — no access logs reviewed; assume possible during window |
| Real harm / risk of significant harm? | Password hashes (bcrypt), not plaintext; still rotate credentials |
| Notification to OPC / individuals required? | **Founder legal review** — document decision below |

**Decision (fill in):**

- [ ] No notification — no evidence of exfiltration; remediated same day  
- [ ] Internal record only — low risk; users force re-login  
- [ ] Notify affected users — if log review confirms access  
- [ ] Notify OPC — if significant harm threshold met  

**Signed:** _________________ **Date:** _________  

## Follow-up

1. Rotate Supabase anon/publishable keys (dashboard) after probe passes with old key  
2. Retain this document + `os/agents/auto-virlux-delivery/INCIDENTS.md` for audit trail  
