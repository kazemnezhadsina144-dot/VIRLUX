# Receipt — VIRLUX Supabase RLS harden (INC-009)

**Date:** 2026-06-09  
**Project:** virlux-staging (`bueoakgiisvufxfbdvoa`)  
**Repo:** ~/Desktop/VIRLUX  
**Trace:** governance_goal_specialist-20260609-005 · VIRLUX Auto-Delivery

## Delivered

| Gate | Status |
|------|--------|
| RLS on 13 tables | `20250608000000_enable_rls` |
| REVOKE anon/authenticated | `20250609000000_revoke_postgrest_grants` |
| Explicit deny-all policies | `20250610000000_deny_postgrest_policies` |
| API hardening (cookies, origin guard, registration lock) | Deployed |
| Security headers + security.txt | web + app |
| CI guards + verify scripts | `scripts/ci-guards.sh`, `verify-supabase-security.sh` |
| Optional platform admin TOTP | `20250611000000_user_totp_secret` + `/api/auth/mfa/*` |

## Founder follow-up (dashboard)

- Rotate Supabase anon/publishable keys after probe passes (dashboard) — then re-run `npm run verify:supabase-security`
- Set `DEMO_SEED_PASSWORD` + re-seed staging if needed
- Wire DNS + Calendly/Loom env vars
- Enable `PLATFORM_ADMIN_MFA_REQUIRED` after MFA enrollment
- Sign `docs/BREACH-ASSESSMENT-INC009.md`

## Verify

```bash
npm run verify:full
```

See `docs/SECURITY-PROGRAM.md` and `scripts/founder-security-checklist.sh`.
