# Interac partner evaluation (post-pilot)

**When:** After manual ops exceeds ~20 deposits/week or ops SLA breaks  
**Current:** Manual confirm via dashboard — [`interac-ops-sop.md`](./interac-ops-sop.md)

---

## Evaluation criteria

| Criterion | Weight | Notes |
|-----------|--------|-------|
| CAD collection API / webhook | High | Auto-match reference + amount |
| FINTRAC / compliance support | High | Required for scale |
| Integration effort | Medium | Weeks vs months |
| Cost per transaction | Medium | Compare to manual ops time |
| Canadian FI partnership | Medium | Credibility for enterprise |

---

## Candidates to research

| Provider | Type | Notes |
|----------|------|-------|
| Manual ops (current) | Ops | Good for 3–5 pilots |
| Flinks / open banking | Data | May assist verification, not collection |
| VoPay / payment API | API | Evaluate e-Transfer business collection |
| Direct FI integration | Bank | Longest timeline, lowest per-tx cost at scale |

---

## Integration shape (future)

```
Bank webhook → POST /api/wallet/deposits/webhook
  → match reference (VRLX-...)
  → completeDeposit(intentId)
  → audit log + Telegram notify
```

Code hook: extend [`apps/api/src/services/deposits.ts`](../apps/api/src/services/deposits.ts) — `completeDeposit()` already idempotent.

---

## Decision gate

Proceed to RFP when:
- [ ] ≥3 pilots active
- [ ] Manual confirm >15 min/day ops time
- [ ] Counsel approves automated on-ramp
- [ ] Unit economics support partner fees
