# Penetration test schedule (VIRLUX)

Per `docs/SECURITY-PROGRAM.md` — annual third-party test before real-money pilot.

| Field | Value |
|-------|--------|
| Target window | Q4 2026 (before real-money gates) |
| Scope | Marketing, dashboard, API, PostgREST, auth/session, webhooks |
| Out of scope | SourceA / internal agent repos |
| Deliverable | Executive summary + remediation tracker (Tier 3 vault) |
| Owner | Founder |
| Status | **Not scheduled** — engage vendor and set date |

## Pre-test checklist

- [ ] Staging URLs documented  
- [ ] Demo credentials in secure channel only  
- [ ] `npm run verify:full` green  
- [ ] Supabase advisors clean  
