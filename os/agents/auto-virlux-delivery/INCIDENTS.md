<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260603
session: d09ef6b2
doc_date: 2026-06-03
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260603** · Auto · VIRLUX Delivery · 2026-06-03

# Incident report — Auto · VIRLUX Delivery

Mistakes, root cause, fix, and **prevention** so they are not repeated without memory.

| ID | Date | Severity | Summary |
|----|------|----------|---------|
| INC-001 | 2026-06-04 | high | Web deploy used API `vercel.json` → 404/500 |
| INC-002 | 2026-06-04 | high | PNG screenshots 404 on live |
| INC-003 | 2026-06-04 | medium | Playwright targeted `virlux.com` lander |
| INC-004 | 2026-06-04 | medium | Login rate-limit flakes in live E2E |
| INC-005 | 2026-06-04 | medium | `approval-flow` timeout — payout section collapsed |
| INC-006 | 2026-06-05 | high | **No persistent memory** — repeated deploy/E2E mistakes |
| INC-007 | 2026-06-05 | medium | **Untagged / undated docs** — other agents could mix edits |
| INC-008 | 2026-06-05 | low | `staging-vercel-env-sync.sh` hung on DEMO_MODE |
| INC-009 | 2026-06-08 | **critical** | Supabase staging DB: 13 tables exposed via PostgREST (no RLS) |

---

## INC-001 — Wrong Vercel config for marketing web

- **Symptom:** `virlux-web.vercel.app` 404/500 or empty build.
- **Cause:** Root `vercel.json` is API config; used for web deploy.
- **Fix:** `deploy_web()` swaps `vercel.web.json` to root before `vercel deploy`.
- **Prevention:** Read MEMORY § web deploy; never `vercel deploy` web without swap script.

## INC-002 — Screenshot PNGs 404

- **Symptom:** `/screenshots/*.png` missing on production.
- **Cause:** Relying on `public/` without Next bundling.
- **Fix:** Static imports in `apps/web/src/components/ProductScreenshotGallery.tsx`.
- **Prevention:** MEMORY § PNGs; verify `#product` gallery loads after deploy.

## INC-003 — E2E against lander

- **Symptom:** Marketing tests fail on `virlux.com`.
- **Cause:** Apex serves `/lander` stub, not full marketing app.
- **Fix:** Default `STAGING_WEB_URL` to `virlux-web.vercel.app`; `skipIfMarketingLander` helper.
- **Prevention:** MEMORY § live surfaces; `smoke:custom-domains` documents expected lander fail.

## INC-004 — Login flake on live

- **Symptom:** Intermittent Playwright login failures.
- **Cause:** API rate limits on repeated demo login.
- **Fix:** `loginAsUser` retry in `e2e/helpers.ts`; `retries: 2` in `playwright.config.ts` for live.
- **Prevention:** Reuse `loginAsDemo`; do not spawn parallel login storms.

## INC-005 — Approval flow reference field

- **Symptom:** Timeout filling reference in approval-flow spec.
- **Cause:** "Recipient payout details" collapsed.
- **Fix:** Expand payout group before fill.
- **Prevention:** Check INC-005 before editing `e2e/approval-flow.spec.ts`.

## INC-006 — No agent memory (meta)

- **Symptom:** Same classes of mistakes across sessions (deploy, DNS, E2E targets).
- **Cause:** No durable MEMORY / INCIDENTS / audit loop.
- **Fix:** This agent home + skill + `agent-self-audit.sh`.
- **Prevention:** **Mandatory loop:** read MEMORY + INCIDENTS → work → self-audit → append AUDIT-LOG.

## INC-007 — Doc tagging without date / cross-agent edits

- **Symptom:** User could not trace which agent wrote which doc; risk of overwriting other agents.
- **Cause:** Generic tag without date; edited shared docs without ownership check.
- **Fix:** Dated tag `VIRLUX-AUTO-DELIVERY-YYYYMMDD`; registry; rule: never edit untagged or other-agent tagged files.
- **Prevention:** Grep `author:` before edit; only touch paths in REGISTRY.md.

## INC-008 — Env sync hang

- **Symptom:** `staging-vercel-env-sync.sh` blocked on DEMO_MODE.
- **Fix:** Set `DEMO_MODE` via direct `vercel env add` on virlux-app.
- **Prevention:** Prefer targeted `vercel env` for single vars; document in audit if script hangs >2m.

---

## INC-009 — Supabase public schema exposed (no RLS)

- **Symptom:** Supabase security email — CRITICAL `rls_disabled_in_public` + `sensitive_columns_exposed` on **virlux-staging** (`bueoakgiisvufxfbdvoa`).
- **Cause:** Prisma `migrate deploy` creates tables in `public` without RLS. Supabase exposes `public` via REST API (anon key). App uses Prisma only, but Data API was still open.
- **Exposure:** `User.passwordHash`, `RefreshToken.tokenHash`, KYC docs, invite tokens, partner webhook secrets, wallet/tx data — readable/writable by anyone with project URL + anon key.
- **Fix:** Applied migration `20250608000000_enable_rls` on staging (RLS on all 13 tables, no policies). API health OK. PostgREST anon select → `[]`, insert → RLS denial.
- **Follow-up (2026-06-09):** Migration `20250609000000_revoke_postgrest_grants` — REVOKE ALL from anon/authenticated + default privileges + revoked all refresh tokens (force re-login).
- **Follow-up (2026-06-10):** Migration `20250610000000_deny_postgrest_policies` — explicit deny-all policies for advisors/audit. TOTP MFA for platform admins (`/api/auth/mfa/*`). Demo passwords moved to `DEMO_SEED_PASSWORD` env.
- **Founder:** Rotate Supabase anon key; set `DEMO_SEED_PASSWORD` + `bash scripts/staging-reseed-demo.sh`; see `scripts/founder-security-checklist.sh`.
- **Prevention:** CI guard for new migrations; comment in `schema.prisma`; always `ENABLE ROW LEVEL SECURITY` on new tables; never add anon policies unless intentional; never commit demo passwords.

---

## New incident template

```markdown
## INC-NNN — Title

- **Symptom:**
- **Cause:**
- **Fix:**
- **Prevention:**
```

Add row to table + section; reference in next AUDIT-LOG entry.
