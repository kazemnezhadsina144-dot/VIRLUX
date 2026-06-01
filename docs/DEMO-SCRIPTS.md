# Demo scripts (founder-led)

Rehearse each path once on live URLs before external meetings. SME/investor sessions use **client layer** only — never open platform ops from marketing.

**Live URLs:** `https://virlux.com` · `https://app.virlux.com`  
**Staging demo:** set `NEXT_PUBLIC_DEMO_MODE=true` on staging app; use demo chip on login.

---

## Investors / accelerators (~5 min)

1. **Homepage (30s)** — Calculator auto-quote, 1% fee, trust row, Book a demo in header.
2. **Register or demo login (1 min)** — Overview → Getting started checklist.
3. **Send $500 (2 min)** — Confirm rate → Send → Payments list → status Pending → Sent/Settled.
4. **Close (30s)** — Book demo CTA + one-liner: *Canadian SMEs pay suppliers globally with transparent 1% and team controls.*

**Materials:** Loom on `/demo`, one-pager from internal blueprint, live URLs in deck.

---

## SME design partners (~15 min)

1. Register → verify business (KYC upload).
2. Add funds → Interac reference → copy reference (platform confirms off-screen on staging).
3. Send payment under threshold → track in Payments.
4. Optional: send over threshold → sign in as `approver@virlux.demo` → approve.
5. Activity log → human-readable events.
6. Offer: 90 days, 1%, $50K/mo cap, one corridor (PH or US).

---

## MSB partners (~20 min — separate session)

**Start in platform-admin tab only** — not linked from marketing.

1. Partner record + webhook secret (`scripts/staging-platform-setup.sh`).
2. Instruction webhook → settlement webhook loop.
3. FINTRAC CSV export.
4. Commercial terms (internal one-pager).

Platform UI labels: "Settlement reference" (not partner jargon).

---

## Advisors / banks (~10 min)

1. Maker-checker on send over threshold.
2. Activity log (audit trail).
3. FINTRAC-ready language — no MSB claim until registered.
4. Pilot scope + volume caps; counsel review in progress.

---

## Pre-meeting checklist

- [ ] `npm run deploy:smoke` green
- [ ] Mobile nav works on marketing + app sidebar
- [ ] No pre-filled credentials on production login
- [ ] Calendly URL in `NEXT_PUBLIC_BOOK_DEMO_URL`
- [ ] Second browser profile ready for approver demo (staging)
