<!--
VIRLUX-AGENT-DOC
author: Auto-VIRLUX-Delivery
agent_tag: VIRLUX-AUTO-DELIVERY-20260603
session: d09ef6b2
doc_date: 2026-06-03
-->

> Agent doc · **VIRLUX-AUTO-DELIVERY-20260603** · Auto · VIRLUX Delivery · 2026-06-03

# Persistent memory — Auto · VIRLUX Delivery

**Read this before any deploy, E2E, or doc write.** Update after verified facts change.

## Global rules (founder — disk wins)

1. Chat is not memory — read [`SESSION-CLOSEOUT.md`](./SESSION-CLOSEOUT.md) + this file + [`os/plan.json`](../../plan.json)
2. No auto-paste into Cursor
3. Repo blockers do not block DevBridge wire
4. Machine validators are truth: `npm run verify:live` / `verify:full` / `agent:self-audit`
5. One task per session; closeout on disk when done

## Live surfaces (last good)

| Surface | URL | Gate |
|---------|-----|------|
| API | https://virlux-api.vercel.app/health | 200 |
| Marketing | https://virlux-web.vercel.app | `#product` in HTML |
| Dashboard | https://virlux-app.vercel.app | 200; demo login |
| Custom apex | https://virlux.com | **lander stub** — not full marketing |
| Custom app | https://app.virlux.com | **not wired** |

## Hard rules (from incidents)

1. **Web deploy** — swap `vercel.web.json` → root `vercel.json` via `scripts/staging-vercel-deploy.sh` `deploy_web()`. Use `--archive=tgz` (15k file limit). Vercel project root dir = `apps/web`.
2. **Marketing E2E / smoke** — default `STAGING_WEB_URL=https://virlux-web.vercel.app`, not `virlux.com`.
3. **Screenshot PNGs** — bundle via static imports in `ProductScreenshotGallery.tsx`; `/public` alone 404s on Vercel for some assets.
4. **Copy authority** — `todolist/PUBLIC-BLUEPRINT.md` → `public-copy.ts` → apps. Never ship `todolist/` to browser.
5. **Other agents' docs** — if `author:` ≠ `Auto-VIRLUX-Delivery`, do not edit. Add new tagged file under `os/agents/auto-virlux-delivery/` instead.
6. **Verify gate** — `npm run verify:live` (smoke + full Playwright on live URLs).

## npm scripts (this agent owns)

| Script | Purpose |
|--------|---------|
| `npm run verify:live` | Full verify ladder (includes verify:book-demo) |
| `npm run verify:book-demo` | Book a demo CTA on live web |
| `npm run verify:full` | verify:live + analytics + DNS smoke (lander WARN) |
| `npm run verify:analytics` | Plausible on web (skips if no domain) |
| `npm run smoke:custom-domains` | DNS smoke; fails on lander (expected) |
| `bash scripts/agent-self-audit.sh` | Pre/post session self-audit |
| `npm run plan:no-asf:pick` | Next prompt from VIRLUX 1000 locked pack |
| `npm run plan:virlux-1000:generate` | Regenerate 1000 prompts (taxonomy change only) |

## Registry & plan pointers

- Artifact list: [`REGISTRY.md`](./REGISTRY.md)
- No-ASF entry: [`os/NO-ASF-PLANS.md`](../../NO-ASF-PLANS.md) (read only unless asked)
- Machine state: [`os/plan.json`](../../plan.json)
- Priority queue: [`os/plan-library/VIRLUX-PRIORITY.md`](../../plan-library/VIRLUX-PRIORITY.md) (**my tag only**)
- **LOCKED 1000 prompts:** [`os/plan-library/VIRLUX-1000-LOCK.md`](../../plan-library/VIRLUX-1000-LOCK.md)

## Founder-only (do not block agent on)

- DNS: `virlux.com` → virlux-web, `app.virlux.com` → virlux-app
- `NEXT_PUBLIC_ANALYTICS_DOMAIN`, Loom, Calendly URLs
- Circle prod keys, FINTRAC copy lock, design partners

## Last memory update

- **2026-06-06** — T1 conversion hardening: `loginFromNextRedirect`, `verify:book-demo`, PNGs in repo, verify:live 15/15.
- **2026-06-03** — Self-audit loop + dated tags + incident log seeded from delivery sprints.
