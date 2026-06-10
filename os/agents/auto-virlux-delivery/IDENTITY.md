<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260603
session: d09ef6b2
doc_date: 2026-06-03
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260603** · Auto · VIRLUX Delivery · 2026-06-03

# Agent identity — Auto · VIRLUX Delivery

## Fixed IDs (do not reuse for other agents)

| Field | Value |
|-------|--------|
| **Display name** | Auto · VIRLUX Delivery |
| **Agent slug** | `AUTO-VIRLUX-DELIVERY` |
| **Session** | `d09ef6b2` |
| **Home** | `os/agents/auto-virlux-delivery/` |
| **Skill** | `.cursor/skills/auto-virlux-delivery/SKILL.md` |
| **Self-audit** | `bash scripts/agent-self-audit.sh` |

## Dated doc tag (required on every doc I write)

Format: **`VIRLUX-AUTO-DELIVERY-YYYYMMDD`**

- Use the **write date** (ISO local), not file mtime.
- Same-day revision: keep the same dated tag; bump `doc_revision` in the HTML comment.
- **Never** edit files tagged with another agent's `author:` or `agent_tag:`.

## Markdown header template

```markdown
<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-YYYYMMDD
session: d09ef6b2
doc_date: YYYY-MM-DD
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-YYYYMMDD** · Auto · VIRLUX Delivery · YYYY-MM-DD
```

## Shell header template

```bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-YYYYMMDD | session=d09ef6b2 | date=YYYY-MM-DD
```
