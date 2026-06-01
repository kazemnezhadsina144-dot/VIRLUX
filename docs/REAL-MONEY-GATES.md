# Real money gates (Phase 5 — deferred)

Do not enable real CAD flows until all gates below are satisfied. Engineering can be ready before legal gates clear.

## Required before first real Interac

| Gate | Owner | Status |
|------|-------|--------|
| Counsel sign-off on pilot volume caps | Founder + counsel | Open |
| Signed pilot LOI (2–3 SMEs) | Founder | Open |
| MSB partner LOI + `webhookSecret` in production DB | Founder + ops | Open |
| Dedicated business Interac account | Founder | Open |
| `PLATFORM_ADMIN_EMAILS` on Railway | Dev | Configure at deploy |
| `ALLOW_ORG_DEPOSIT_CONFIRM=false` in production | Dev | Default in `railway.toml` |
| Manual Interac SOP trained | Ops | `todolist/interac-ops-sop.md` |

## Required before public MSB claims

| Gate | Code switch |
|------|-------------|
| FINTRAC MSB number verified | `fintracMsbClaim: true` in `@virlux/shared` |
| Counsel approves public registration copy | Marketing + `/terms` |

## Deferred engineering

| Item | Notes |
|------|-------|
| Real Interac API (Flinks/VoPay/FI) | After manual ops bottleneck |
| Circle production | Partner path — sandbox for dev demos only |
| Dual approval above threshold | Enterprise customer request |
| Automated partner webhooks | After MSB partner technical integration |

## Production defaults (must not change without counsel)

```
SETTLEMENT_MODE=partner
AUTO_SETTLE=false
fintracMsbClaim=false
```
