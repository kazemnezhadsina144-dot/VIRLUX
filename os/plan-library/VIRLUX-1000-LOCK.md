<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260606
session: d09ef6b2
doc_date: 2026-06-06
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260606** · Auto · VIRLUX Delivery · 2026-06-06

# VIRLUX 1000 — LOCKED agent prompt pack

**Status:** LOCKED · **Count:** 1000 · **Agent:** Auto · VIRLUX Delivery

## Start here

| Item | Path |
|------|------|
| **Machine index** | [`virlux-1000/REGISTRY.json`](virlux-1000/REGISTRY.json) |
| **Prompt files** | [`virlux-1000/prompts/`](virlux-1000/prompts/) `vx-0001` … `vx-1000` |
| **Validation matrix** | [`virlux-1000/VALIDATION.md`](virlux-1000/VALIDATION.md) |
| **Curated queue** | [`VIRLUX-PRIORITY.md`](VIRLUX-PRIORITY.md) |
| **Global 1000 pack** | `~/.cursor/plans/no-asf-library/` (ecosystem lane rotation) |

## When you say PLAN WITH NO ASF

```bash
bash scripts/pick-virlux-no-asf-plan.sh 1    # next agent prompt
# read os/plan-library/virlux-1000/<path> → Agent prompt section
# implement → verify → mark done → sync
npm run verify:full
bash scripts/sync-virlux-no-asf-registry.sh
npm run agent:self-audit
```

## Regenerate (taxonomy change only)

```bash
npm run plan:virlux-1000:generate
```

## Phases (VIRLUX-specific)

| Phase | Focus |
|-------|--------|
| `phase-v0-verify-gates` | verify:live, verify:full, self-audit, CI |
| `phase-v1-deploy-vercel` | web/app/api deploy, Supabase, archive=tgz |
| `phase-v2-e2e-playwright` | Live E2E, flakes, screenshots |
| `phase-v3-copy-compliance` | public-copy, drift, blueprint surface |
| `phase-v4-api-backend` | Prisma, auth, rates, transactions |
| `phase-v5-dashboard-ux` | Dashboard pages, loading, CLIENT_COPY |
| `phase-v6-conversion-gtm` | Book demo, DNS, PNGs, analytics |
| `phase-v7-money-compliance` | Circle/FINTRAC gates (founder-skipped in pick) |
| `phase-v8-platform-partners` | Design partners, platform, outreach |
| `phase-v9-scale-research` | Scale, observability, agent workflow research |

## Pinned evidence (done)

13 delivery pins — see [`VIRLUX-PRIORITY.md`](VIRLUX-PRIORITY.md) T0/T1/T2 done tables.

## Founder-only (pick script skips)

- `pinned-virlux-real-money-gates`
- `pinned-virlux-design-partners`
- Prompts containing `Founder:` / Circle prod / todolist edit
