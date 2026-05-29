# Circle staging checklist

**Goal:** Prove USDC settlement E2E on staging before production keys  
**Last updated:** 2026-05-29

---

## Prerequisites

- [ ] Circle developer account — https://developers.circle.com  
- [ ] Sandbox API key generated  
- [ ] Sandbox wallet created; note **Wallet ID**  
- [ ] Destination test wallet (MetaMask etc.) on **Polygon** recommended (low gas)  
- [ ] Staging API deployed (Railway) or local with keys in `.env`

---

## Environment variables (staging)

```env
CIRCLE_API_KEY=TEST_API_KEY:...
CIRCLE_SANDBOX=true
CIRCLE_WALLET_ID=your-wallet-id
AUTO_SETTLE=false
```

Verify health (dev only shows circle block):

```bash
curl -s http://localhost:3002/health | jq .circle
# configured: true, reachable: true
```

---

## Pre-flight

- [ ] `npm run build && npm test` pass  
- [ ] Fund sandbox wallet with test USDC (Circle faucet / sandbox docs)  
- [ ] User account: KYC **approved**, CAD balance sufficient for test send  
- [ ] Send amount **below** approval threshold OR have second user as approver  

---

## E2E test script

1. **Login** dashboard  
2. **Deposit** CAD (manual confirm if not dev AUTO_SETTLE)  
3. **Send** payment with:
   - Recipient wallet: your test Polygon address  
   - Network: **polygon**  
   - Amount: small (e.g. $50 CAD equivalent)  
4. **Approve** if required (maker-checker)  
5. **Wait** — API polls Circle transfer status (up to ~20s)  
6. **Verify transaction** → status `confirmed`, `circleTransferId` set  
7. **Verify wallet** — USDC received on-chain (Polygonscan sandbox/explorer)  

---

## Failure paths to test

| Test | Expected |
|------|----------|
| Invalid wallet address | Send rejected at validation or Circle fail → `failed` + CAD refund |
| Circle API down / bad key | `failed`, `failureReason` mentions Circle |
| Insufficient sandbox USDC | Circle transfer fails → refund |

---

## Code references

| Piece | Location |
|-------|----------|
| Transfer initiate | `apps/api/src/integrations/circle/client.ts` → `transferUsdc` |
| Status polling | `pollTransferComplete` |
| Settlement | `apps/api/src/services/transactions.ts` → `settleTransaction` |
| Refund on fail | `failTransaction` |

---

## Production graduation (later)

- [ ] Separate prod API key + wallet — never reuse sandbox  
- [ ] `CIRCLE_SANDBOX=false`  
- [ ] Treasury min-balance alerts  
- [ ] Webhook for transfer status (optional; polling exists)  
- [ ] Runbook in ops docs  
- [ ] Counsel sign-off on outbound crypto  

---

## Smoke after deploy

```bash
export NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app
npm run deploy:smoke
```

Then run one sandbox send from staging dashboard.
