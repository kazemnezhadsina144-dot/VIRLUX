# Launch blockers (before real money)

These are **not code bugs** — they are product/compliance/infra requirements a founder must handle before taking customer funds.

Status key: `open` | `in-progress` | `done`

---

## Critical

| Status | Item | Notes |
|--------|------|-------|
| open | **Interac confirmation** | No banking webhook yet; deposits stay `pending` in prod until a real confirmation path is wired (admin or bank webhook → `completeDeposit`). |
| open | **KYC review UI** | Admin approve/reject routes + dashboard for production compliance ops (API has `approveKyc`/`rejectKyc` services; no prod UI/routes exposed). |
| open | **httpOnly cookie auth** | JWTs still in `localStorage` (XSS risk). Move to BFF or httpOnly, Secure, SameSite cookies for production. |
| open | **Legal review** | Full Terms of Service; privacy policy beyond stub; **MSB registration claims only when actually registered** with published registration number. |
| open | **Circle production** | Sandbox skeleton exists; need prod keys, transfer status webhooks/polling, and runbook before live USDC settlement. |

---

## Infrastructure

| Status | Item | Notes |
|--------|------|-------|
| open | **Production Postgres** | Railway/Docker Postgres; `prisma migrate deploy` on deploy (not seed in prod). |
| open | **Production env** | `AUTO_SETTLE=false`, strong `JWT_SECRET`, `TELEGRAM_MODE=webhook`, `CORS_ORIGINS` for Vercel domains. |
| open | **Remove demo seed in prod** | `demo@virlux.com` only via dev seed; Dockerfile must not run seed on every deploy. |

---

## Added from fintech audit (v2.2)

| Status | Item | Notes |
|--------|------|-------|
| done | Atomic quote + debit + tx create | Quote consume race fixed. |
| done | Settlement: no USDC credit on external remittance | Circle failure refunds fiat. |
| done | `AUTO_SETTLE` dev-only | Blocked in production startup. |
| done | Maker-checker approvals | Org-scoped; no self-approval. |
| done | Telegram link via one-time token | No email hijack via `/link`. |
| open | Refresh token rotation / reuse detection | Stolen refresh family not fully revoked on reuse. |
| open | Dual approval above higher threshold | Optional enterprise control. |
| open | Real Interac provider integration | Beyond simulated dev completion. |
