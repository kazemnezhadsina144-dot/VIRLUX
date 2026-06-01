# GTM media checklist (founder)

Complete after deploy. See [LIVE-DEPLOY-RUNBOOK.md](./LIVE-DEPLOY-RUNBOOK.md).

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

- [ ] PNGs committed or uploaded via Vercel deploy
- [ ] Capture: `bash scripts/capture-product-screenshots.sh` (after deploy, against live app URL)
- [ ] Homepage `#product` gallery shows PNGs (auto-falls back to SVG until PNGs exist)

## Optional analytics

- [ ] Create Plausible site for virlux.com
- [ ] Set `NEXT_PUBLIC_ANALYTICS_DOMAIN=virlux.com` on web Vercel
- [ ] Events wired: `demo_booked`, `register`, `first_send`
