<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260606
session: d09ef6b2
doc_date: 2026-06-06
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260606** · Auto · VIRLUX Delivery · 2026-06-06

# VIRLUX 1000 — source validation matrix

Checked when pack was locked (2026-06-06).

## Authority sources

| Source | Role | In repo? | Covered in 1000? |
|--------|------|----------|------------------|
| `todolist/SYSTEM.md` | Constitution | gitignored | Referenced; never commit |
| `todolist/PUBLIC-BLUEPRINT.md` | Copy SOT | gitignored | phase-v3 + pick skips |
| `packages/shared/src/public-copy.ts` | Browser copy | yes | phase-v3 |
| `os/plan.json` | Delivery state | yes | all verify prompts |
| `os/plan-library/VIRLUX-PRIORITY.md` | Curated pins | yes | closeout on every prompt |
| `os/agents/auto-virlux-delivery/*` | Agent memory | yes | pre-flight every prompt |
| `~/.cursor/plans/no-asf-library` | Global 1000 | external | linked; lane virlux ~96 |
| `docs/GTM-MEDIA-CHECKLIST.md` | Founder GTM | yes | phase-v6 |
| `INCIDENTS.md` | Mistake log | yes | phase-v0/v1/v2 |

## Recent delivery evidence (baked in)

| Sprint | Pins | Verify |
|--------|------|--------|
| Verify ladder | verify-ladder | verify:live |
| T1 conversion | e2e-stable, gtm-env-ready | 3× send-flow, verify:book-demo |
| T2 ops | deploy-archive, verify-full | --archive=tgz, verify:full |

## Critics / gaps addressed

| Gap | Prompt phase | Notes |
|-----|--------------|-------|
| No session memory | v0, v9 | MEMORY + AUDIT-LOG mandatory |
| Wrong vercel.json deploy | v1 | swap + restore |
| PNG 404 on live | v2, v6 | static imports + capture |
| virlux.com lander | v2, v6 | skip + WARN in verify:full |
| Login rate limit flake | v2 | retry helpers |
| 15k Vercel file limit | v1 | --archive=tgz |
| Untagged agent docs | v0 | self-audit + dated tags |
| Founder DNS/Calendly | v6 | document; pick skips |
| Real money / FINTRAC | v7 | founder-only prompts |
| Design partners | v8 | founder backlog |

## Agent workflow vs best practice

| Practice | VIRLUX implementation |
|----------|----------------------|
| Read memory before act | Every prompt pre-flight |
| Verify after ship | Tier-specific verify command |
| No cross-agent doc mix | REGISTRY ownership |
| Idempotent pick | `pick-virlux-no-asf-plan.py` skips founder |
| Locked catalog | `locked: true` in REGISTRY.json |

## Count check

```bash
python3 -c "import json; print(len(json.load(open('os/plan-library/virlux-1000/REGISTRY.json'))['plans']))"
# expect: 1000
```
