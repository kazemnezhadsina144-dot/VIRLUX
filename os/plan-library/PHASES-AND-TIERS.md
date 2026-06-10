# Phases and tiers (no-ASF library)

Synced from `~/.cursor/plans/no-asf-library/REGISTRY.json`.

## Phases

| Phase | ID | Focus |
|-------|-----|--------|
| 0 | `phase-0-closeout-verify` | Closeout gates: hub UI, npm check, n8n smoke, ops sync |
| 1 | `phase-1-mobile-ship` | Cursor OS Pro device parity, TestFlight, App Store |
| 2 | `phase-2-voice-agent` | Voice UX, STT/TTS, Deepgram, realtime duplex |
| 3 | `phase-3-monetization` | StoreKit, premium gates, pricing, revenue analytics |
| 4 | `phase-4-hub-automation` | Sina Command hub, Essentials, n8n spine, Layer A ops |
| 5 | `phase-5-noetfield-cloud` | Noetfield cloud ship, TLE, copilot, docs/ops PRs |
| **6** | **`phase-6-commercial-lanes`** | **TrustField, VIRLUX, MergePack, 777 product moves** |
| 7 | `phase-7-wire-devbridge` | AI Dev Bridge wire, M8 gates, Tailscale G3 |
| 8 | `phase-8-platform-infra` | Mono :8000, runtime, observability, security |
| 9 | `phase-9-long-horizon` | Multi-tenant, federation, research, platform scale |

**VIRLUX primary phase:** 6. Long-horizon scale items also appear in phase 9 when lane cycles.

## Tiers

| Tier | Meaning | Pick order |
|------|---------|------------|
| **T0** | Critical — blocks ship, safety, or revenue | First |
| **T1** | High — next sprint in active product lane | Second |
| **T2** | Medium — quarterly upgrade | Third |
| **T3** | Low — research / optional polish | Last |

## Grid

```
10 phases × 4 tiers × 25 plans = 1000 backlog items
```

Each cell is 25 generated plans; lane rotates (`virlux` ≈ 100 entries across the full 1000).
