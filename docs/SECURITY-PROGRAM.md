# VIRLUX security program (PIPEDA / Canadian SME fintech baseline)

## Technical safeguards (implemented)

- Supabase Postgres: RLS on all app tables, explicit deny policies, `REVOKE ALL` from `anon`/`authenticated`
- API-only data access via Prisma (`DATABASE_URL`); no Supabase client in browser bundles
- HttpOnly / Secure / SameSite=Lax session cookies; no JWT echo in production JSON responses
- Helmet, HSTS, CSP on web/app; origin guard + rate limits on API
- RFC 9116 `security.txt` on marketing + dashboard apps
- CI guards block RLS/grant regressions and committed secrets

## Access control

- Platform admin console gated by `PLATFORM_ADMIN_EMAILS`
- Optional TOTP MFA: `POST /api/auth/mfa/setup` → `POST /api/auth/mfa/activate`
- Set `PLATFORM_ADMIN_MFA_REQUIRED=true` after all platform admins enroll

## Demo / staging credentials

- Passwords live in `DEMO_SEED_PASSWORD` / `E2E_DEMO_PASSWORD` (Tier 3) — never in git
- Re-seed staging after rotation: `SEED_DATABASE=true npm run db:seed -w @virlux/api`

## Incident response

- Log incidents in `os/agents/auto-virlux-delivery/INCIDENTS.md`
- PIPEDA breach notification language on `/privacy`
- Post-incident: rotate Supabase anon key, revoke refresh tokens (migration pattern in INC-009)

## Annual penetration test

- Schedule third-party pen test before real-money pilot (target: Q4 each calendar year)
- Scope: marketing, dashboard, API, Supabase PostgREST exposure, auth/session flows
- Store executive summary + remediation tracker outside git (Tier 3 / founder vault)

## Verification commands

```bash
npm run security:clean
npm run verify:security-headers
npm run verify:supabase-security   # requires VIRLUX_SUPABASE_ANON_KEY
npm run verify:live
bash scripts/founder-security-checklist.sh
```

## Production env (must never be true on Vercel API)

- `ALLOW_OPEN_REGISTRATION`
- `DEMO_FUND_ENABLED`
- `AUTO_SETTLE`

`npm run staging:validate-env` fails fast if these are set with `NODE_ENV=production`.
