<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260605
session: d09ef6b2
doc_date: 2026-06-05
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260605** · Auto · VIRLUX Delivery · 2026-06-05

# VIRLUX priority queue (curated)

**Updated:** 2026-06-06 · **Lane:** virlux · **Thread:** THREAD-PORTFOLIO

Curated from `os/plan.json`, T1 conversion + T2 ops hardening.

## T0 — do now (founder)

| ID | Title | Status |
|----|-------|--------|
| `pinned-virlux-real-money-gates` | Circle prod keys, FINTRAC copy lock, prod approval thresholds | backlog |
| `pinned-virlux-design-partners` | 10-logo vertical pilot + case study | backlog |

## T0 — done (evidence)

| ID | Title | Evidence |
|----|-------|----------|
| `pinned-virlux-vercel-api-live` | API on Vercel + Supabase pooler | https://virlux-api.vercel.app/health |
| `pinned-virlux-ui-copy-upgrade` | CLIENT_COPY, drift scan | `npm run ci:guards` |
| `pinned-virlux-dns-custom-domains` | DNS wired (partial) | virlux.com 200; app.virlux.com pending |
| `pinned-virlux-vercel-web-app-deploy` | Web deploy + vercel.web.json swap | https://virlux-web.vercel.app (200) |
| `pinned-virlux-e2e-playwright` | Full live suite | 15/15 Playwright |
| `pinned-virlux-png-screenshots` | Capture script + repo PNGs | `apps/web/public/screenshots/*.png` |
| `pinned-virlux-live-png-web` | Bundled gallery on production | `#product` on live web |
| `pinned-virlux-custom-domain-gtm` | DNS checklist + smoke script | `scripts/smoke-custom-domains.sh` |
| `pinned-virlux-verify-ladder` | `npm run verify:live` | 15/15 Playwright live |
| `pinned-virlux-e2e-stable` | send-flow middleware + 3× live | 0 flaky; `loginFromNextRedirect` |
| `pinned-virlux-gtm-env-ready` | Book demo CTA gate | `npm run verify:book-demo` |

## T1 — done (evidence)

| ID | Title | Evidence |
|----|-------|----------|
| `pinned-virlux-e2e-stable` | Zero flaky send-flow on live | 3× `--project=send-flow` pass |
| `pinned-virlux-gtm-env-ready` | Book-demo verify script | `npm run verify:book-demo` (mailto until Calendly) |

## T2 — done (evidence)

| ID | Title | Evidence |
|----|-------|----------|
| `pinned-virlux-deploy-archive` | Vercel deploy `--archive=tgz` | `scripts/staging-vercel-deploy.sh` |
| `pinned-virlux-verify-full` | Full ladder + DNS warn | `npm run verify:full` — 15/15 + lander WARN |

## T1 — next (founder)

| Theme | Action |
|-------|--------|
| GTM media | Loom, Calendly `NEXT_PUBLIC_BOOK_DEMO_URL` on virlux-web |
| Analytics | `NEXT_PUBLIC_ANALYTICS_DOMAIN` + `npm run verify:analytics` |
| Custom DNS | Point virlux.com → virlux-web (not /lander); `app.virlux.com` |

## VIRLUX 1000 locked pack

| Item | Path |
|------|------|
| Lock index | [`VIRLUX-1000-LOCK.md`](VIRLUX-1000-LOCK.md) |
| 1000 prompts | [`virlux-1000/prompts/`](virlux-1000/prompts/) `vx-0001`–`vx-1000` |
| Pick next | `npm run plan:no-asf:pick` |

## How to pull the next plan

1. **`npm run plan:no-asf:pick`** — agent-runnable from locked 1000
2. Or filter `virlux-registry.json` / global `na-*` for lane `virlux`
3. Cross-check `todolist/PUBLIC-BLUEPRINT.md` before customer-facing copy
