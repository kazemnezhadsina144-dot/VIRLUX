<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260603
session: d09ef6b2
doc_date: 2026-06-03
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260603** · Auto · VIRLUX Delivery · 2026-06-03

# Doc registry — Auto · VIRLUX Delivery only

**Only files listed here may be edited by this agent.** All carry dated tag `VIRLUX-AUTO-DELIVERY-*`.

## Agent home (always mine)

| Path | Tag date | Purpose |
|------|----------|---------|
| `os/agents/auto-virlux-delivery/IDENTITY.md` | 2026-06-03 | IDs + header templates |
| `os/agents/auto-virlux-delivery/MEMORY.md` | 2026-06-03 | Persistent facts |
| `os/agents/auto-virlux-delivery/INCIDENTS.md` | 2026-06-03 | Mistake log |
| `os/agents/auto-virlux-delivery/AUDIT-LOG.md` | 2026-06-03 | Session audits |
| `os/agents/auto-virlux-delivery/REGISTRY.md` | 2026-06-03 | This file |
| `os/agents/auto-virlux-delivery/LOOP.md` | 2026-06-03 | Self-audit loop SOP |
| `os/agents/auto-virlux-delivery/SESSION-CLOSEOUT.md` | 2026-06-06 | Disk wins + last closed task |
| `.cursor/skills/auto-virlux-delivery/SKILL.md` | 2026-06-05 | Agent skill |
| `.cursor/rules/virlux-agent-doc-tagging.mdc` | 2026-06-05 | Tagging rule |

## Ops docs & scripts (mine)

| Path | Tag date | Purpose |
|------|----------|---------|
| `docs/GTM-MEDIA-CHECKLIST.md` | 2026-06-05 | GTM + DNS checklist |
| `os/plan-library/VIRLUX-PRIORITY.md` | 2026-06-05 | Pinned queue + evidence |
| `scripts/verify-live.sh` | 2026-06-06 | Verify ladder + book-demo |
| `scripts/verify-book-demo.sh` | 2026-06-06 | Book demo CTA gate |
| `scripts/verify-full.sh` | 2026-06-06 | Full verify + analytics + DNS warn |
| `scripts/generate-virlux-1000-prompts.py` | 2026-06-06 | 1000 prompt generator |
| `scripts/pick-virlux-no-asf-plan.py` | 2026-06-06 | Pick next no-ASF prompt |
| `scripts/pick-virlux-no-asf-plan.sh` | 2026-06-06 | Pick wrapper |
| `os/plan-library/VIRLUX-1000-LOCK.md` | 2026-06-06 | Locked pack index |
| `os/plan-library/virlux-1000/VALIDATION.md` | 2026-06-06 | Source validation matrix |
| `scripts/verify-analytics.sh` | 2026-06-05 | Analytics check |
| `scripts/smoke-custom-domains.sh` | 2026-06-05 | Custom domain smoke |
| `scripts/agent-self-audit.sh` | 2026-06-03 | Self-audit runner |

## Explicitly NOT mine — do not edit

- docs/LIVE-DEPLOY-RUNBOOK.md — founder / other agents
- os/NO-ASF-PLANS.md — repo SOT pointer
- todolist/* — gitignored constitution
- ~/.cursor/plans/no-asf-library/* — global no-ASF library
- Any file without author Auto-VIRLUX-Delivery — other agent

## Register new artifact

1. Write file with dated tag for **today's** `YYYYMMDD`.
2. Add row to this table.
3. Append AUDIT-LOG entry.
