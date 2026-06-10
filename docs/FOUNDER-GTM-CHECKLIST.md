# Founder GTM checklist

Public product parity must be live before submissions. Audience demo scripts: [DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md). Deploy: [LIVE-DEPLOY-RUNBOOK.md](./LIVE-DEPLOY-RUNBOOK.md). Media: [GTM-MEDIA-CHECKLIST.md](./GTM-MEDIA-CHECKLIST.md). Outreach: [ACCELERATOR-SUBMISSION-TEMPLATE.md](./ACCELERATOR-SUBMISSION-TEMPLATE.md), [PILOT-OUTREACH-TEMPLATE.md](./PILOT-OUTREACH-TEMPLATE.md).

## Prerequisites

- [ ] `virlux.com` marketing live (converter, 1%, book demo, mobile nav)
- [ ] `app.virlux.com` dashboard live (register → login works)
- [ ] `NEXT_PUBLIC_BOOK_DEMO_URL` set on Vercel (Calendly)
- [ ] `NEXT_PUBLIC_API_URL` points to Railway API (not placeholder hostname)
- [ ] 5-min investor script rehearsed ([DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md))

## Staging demo mode

- [ ] `NEXT_PUBLIC_DEMO_MODE=true` on staging app only (never production)
- [ ] `DEMO_APPROVAL_THRESHOLD=100` on staging API for maker-checker demos
- [ ] Seed includes `approver@virlux.demo` (password via `DEMO_SEED_PASSWORD`)
- [ ] Optional: `NEXT_PUBLIC_DEMO_LOOM_URL` on marketing for `/demo` embed

## Manual acceptance (per audience)

### Investor (5 min)

- [ ] Homepage loads on phone; hamburger opens nav
- [ ] Calculator shows quote without clicking
- [ ] Book demo opens Calendly
- [ ] Login → overview checklist → send $500 → payment visible

### SME (15 min)

- [ ] Full loop: KYC → Interac ref (copy button) → send → track status
- [ ] Over-threshold payment shows approval flow (staging approver account)

### MSB (20 min)

- [ ] Platform ops in separate tab; settlement reference labels
- [ ] Webhook loop tested once on staging

### Advisors (10 min)

- [ ] Activity log human labels; maker-checker explained
- [ ] No MSB claims on public surfaces (`npm run ci:guards`)

## Accelerator submissions

| Program | URL / portal | Materials |
|---------|--------------|-----------|
| CodeLaunch Canada | codelaunch.ca | Live URLs, one-liner, Loom demo |
| OCI (Ontario) | ontario.ca/oci | Scale-ready SME fintech angle |
| BC Tech / Innovate BC | bctech.ca | Vancouver HQ |
| Spark / Elevate | Regional portals | Early visibility |

- [ ] ≥2 applications submitted

## Pilot outreach (2–3 design partners)

- ICP: Canadian SME $500K–$5M, pays overseas suppliers
- Offer: 90 days, 1% fee, $50K CAD/month cap, one corridor (PH or US)
- Template: `todolist/pilot-outreach-pack.md`
- [ ] ≥2 pilot conversations started
- Track conversations in spreadsheet; signed LOI before real Interac

## Parallel founder actions

- [ ] Calendly URL live and linked from header
- [ ] Counsel brief sent (`todolist/counsel-review-brief.md`)
- [ ] MSB partner tracker active (`todolist/msb-partner-tracker.md`)
- [ ] Do **not** set `fintracMsbClaim: true` until MSB number verified

## Deploy verification

```bash
RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all
npm run deploy:smoke
npm run staging:live-e2e
npm run staging:partner-e2e
```

## Success metrics (exit)

- Live URLs + mobile-usable marketing and dashboard
- Rehearsed scripts for investor / SME / MSB / advisor
- ≥2 accelerator applications · ≥2 pilot conversations · counsel engaged
