<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260605
session: d09ef6b2
doc_date: 2026-06-05
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260605** · Auto · VIRLUX Delivery · 2026-06-05

# GTM media checklist (founder)

Complete after deploy. See [LIVE-DEPLOY-RUNBOOK.md](./LIVE-DEPLOY-RUNBOOK.md).

## Custom DNS (conversion blocker)

Wire in Vercel project **Domains** (not parking / lander):

| Host | Vercel project | Verify |
|------|----------------|--------|
| `virlux.com` (+ `www` → apex) | **virlux-web** | `curl -sL https://virlux.com/ \| grep 'id="product"'` |
| `app.virlux.com` | **virlux-app** | `curl -sI https://app.virlux.com/` → 200 |

Agent smoke (no registrar access): `bash scripts/smoke-custom-domains.sh`

Until DNS is correct, marketing E2E uses `https://virlux-web.vercel.app`.

## Loom (5-min investor walkthrough)

- [ ] Record: homepage calculator → demo login → send $500 → payments → book demo CTA
- [ ] Publish on Loom (unlisted or public)
- [ ] Set `NEXT_PUBLIC_DEMO_LOOM_URL` on **virlux-web** Vercel (embed URL)
- [ ] Verify https://virlux.com/demo shows iframe

Script: [DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md) — Investors / accelerators (~5 min)

## Calendly

- [ ] Create event type (e.g. "VIRLUX demo — 30 min")
- [ ] Set `NEXT_PUBLIC_BOOK_DEMO_URL` on **virlux-web** and **virlux-app** Vercel
- [ ] Click "Book a demo" in header — opens Calendly (not mailto)

## Dashboard screenshots (homepage)

Capture on **live app** after deploy (logged in as demo account):

| File | Screen |
|------|--------|
| `apps/web/public/screenshots/overview.png` | Dashboard overview + balance |
| `apps/web/public/screenshots/send.png` | Send payment with rate confirmed |
| `apps/web/public/screenshots/payments.png` | Payments list with status badges |

- [x] PNGs captured (`apps/web/public/screenshots/*.png`)
- [x] Gallery bundles PNGs in Next build (`ProductScreenshotGallery` static imports)
- [ ] Capture refresh: `PLAYWRIGHT_APP_URL=https://virlux-app.vercel.app E2E_DEMO_LOGIN=1 bash scripts/capture-product-screenshots.sh` then redeploy web
- [ ] Verify live: `curl -sL https://virlux-web.vercel.app/ | grep 'id="product"'`

## Optional analytics

- [ ] Create Plausible site for virlux.com
- [ ] Set `NEXT_PUBLIC_ANALYTICS_DOMAIN=virlux.com` on web Vercel
- [ ] Events wired: `demo_booked`, `register`, `first_send`
