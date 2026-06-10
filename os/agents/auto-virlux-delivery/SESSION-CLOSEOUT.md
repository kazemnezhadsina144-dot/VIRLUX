<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260606
session: d09ef6b2
doc_date: 2026-06-06
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260606** · Auto · VIRLUX Delivery · 2026-06-06

# Session closeout (disk wins)

**Chat is not memory — read this file + MEMORY + plan.json every session.**

## Global rules (locked)

1. **Disk wins** — `os/plan.json`, `virlux-1000/REGISTRY.json`, `AUDIT-LOG.md` are truth
2. **No auto-paste into Cursor** — agents read paths; do not dump blueprints into chat
3. **Repo blockers ≠ DevBridge wire** — VIRLUX blockers do not block other lanes
4. **Machine validators are truth** — `npm run verify:live`, `verify:full`, `agent:self-audit`; not ASF guesses
5. **One task per session** — one `vx-*` prompt or one pinned pin
6. **Session closeout on disk when done** — update this file + AUDIT-LOG + plan.json `verify_last`

## Last closed task

| Field | Value |
|-------|--------|
| **Prompt** | `vx-0001` — verify:live gate |
| **Status** | **done** (on disk) |
| **Evidence** | `os/plan.json` `verify_last` · `vx-0001.md` `status: done` |
| **Validator** | `npm run verify:live` exit 0 · 15/15 · 0 flaky (2026-06-07) |

## Next pick (disk)

```bash
npm run plan:no-asf:pick
# → vx-0002: verify:full + lander WARN in AUDIT-LOG
```

## Live surfaces (validator snapshot)

| URL | Gate |
|-----|------|
| https://virlux-api.vercel.app/health | 200 |
| https://virlux-web.vercel.app | `#product` |
| https://virlux-app.vercel.app | demo login |
| https://virlux.com | lander stub (WARN in verify:full) |
