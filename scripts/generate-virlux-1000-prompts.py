#!/usr/bin/env python3
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260606 | session=d09ef6b2 | date=2026-06-06
"""Generate 1000 concrete VIRLUX agent prompts (10 phases × 4 tiers × 25). LOCKED pack."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "os" / "plan-library" / "virlux-1000"
PROMPTS = PACK / "prompts"

PHASES = [
    ("phase-v0-verify-gates", "Verify ladder, smoke, self-audit, CI guards"),
    ("phase-v1-deploy-vercel", "Vercel web/app/api, Supabase, deploy scripts"),
    ("phase-v2-e2e-playwright", "Live Playwright, flakes, helpers, screenshots"),
    ("phase-v3-copy-compliance", "public-copy, drift scan, blueprint alignment"),
    ("phase-v4-api-backend", "Prisma, auth, rates, transactions, telegram"),
    ("phase-v5-dashboard-ux", "Send, deposits, KYC, approvals, settings UX"),
    ("phase-v6-conversion-gtm", "Book demo, analytics, DNS smoke, PNG gallery"),
    ("phase-v7-money-compliance", "Circle, FINTRAC copy, thresholds, demo fund"),
    ("phase-v8-platform-partners", "Design partners, outreach, platform admin"),
    ("phase-v9-scale-research", "Performance, observability, multi-tenant research"),
]

TIERS = [
    ("T0", "Critical — agent can verify without founder"),
    ("T1", "High — next sprint"),
    ("T2", "Medium — quarterly hardening"),
    ("T3", "Low — research / polish"),
]

# 25 concrete task stems per phase (tier adjusts depth in body)
PHASE_TASKS: list[list[str]] = [
    [  # v0 verify
        "Run npm run verify:live and fix any failing step",
        "Run npm run verify:full; document lander WARN in AUDIT-LOG",
        "Run npm run agent:self-audit; fix registry tag gaps",
        "Extend scripts/ci-guards.sh for new drift pattern",
        "Harden scripts/staging-smoke.sh API meta checks",
        "Add verify step to scripts/post-deploy-verify.sh",
        "Wire npm run verify:book-demo into CI when web changes",
        "Add npm run verify:analytics skip message clarity",
        "Document verify ladder in os/agents/auto-virlux-delivery/MEMORY.md",
        "Append INCIDENT if verify flake; add prevention rule",
        "Run npm test -w @virlux/shared; fix failures",
        "Run npm run build for web+app+api; fix compile errors",
        "Validate packages/shared drift-prevention.test.ts green",
        "Add shellcheck pass for new scripts in scripts/",
        "Ensure e2e/helpers login retry covers rate limits",
        "Add playwright project isolation for flaky suites",
        "Run deploy:smoke after env change",
        "Sync os/plan.json verify_last after green gate",
        "Run bash scripts/sync-virlux-no-asf-registry.sh",
        "Update os/plan-library/VIRLUX-PRIORITY.md evidence row",
        "Cross-check live URLs in MEMORY vs curl",
        "Validate #product on virlux-web.vercel.app",
        "Validate demo login on virlux-app.vercel.app",
        "Validate API /health and /api/meta/config",
        "Produce AUDIT-LOG entry with verify command output",
    ],
    [  # v1 deploy
        "Deploy virlux-web with vercel.web.json swap and --archive=tgz",
        "Restore vercel.api.json to root vercel.json after web deploy",
        "Deploy virlux-app from repo root (Root Directory apps/app)",
        "Deploy virlux-api via vercel.api.json entrypoints",
        "Audit NEXT_PUBLIC_API_URL on web and app Vercel projects",
        "Run staging-prepare-env.sh; fix missing vars",
        "Run staging-supabase-db-url.sh pooler URL",
        "Guard railway sqlite in staging scripts",
        "Fix staging-vercel-deploy.sh trap for vercel.json restore",
        "Document deploy path in agent MEMORY (not LIVE-DEPLOY-RUNBOOK)",
        "Add deploy smoke after web-only deploy",
        "Verify static PNG imports build in apps/web",
        "Check docker-compose.yml local stack boots",
        "Validate apps/api prisma generate on Vercel build",
        "Test api/health.ts and api/index.ts routes",
        "Sync CORS for new Vercel preview URL",
        "Add VERCEL_SCOPE default the-777-foundation check",
        "Harden .env.example without secrets",
        "Validate vercel.web.json has no bad outputDirectory",
        "Run staging-wire-production.sh dry notes",
        "Check apps/app middleware cookie names",
        "Verify API proxy route apps/app/api/[...path]",
        "Test Supabase connection string format aws-1 pooler",
        "Add deploy failure INCIDENT template usage",
        "Redeploy after PNG commit with archive=tgz",
    ],
    [  # v2 e2e
        "Fix flaky send-flow middleware test with loginFromNextRedirect",
        "Run 3× npx playwright test --project=send-flow on live",
        "Harden approval-flow payout details expand step",
        "Add skipIfMarketingLander to new marketing tests",
        "Default PLAYWRIGHT_WEB_URL to virlux-web.vercel.app",
        "Set E2E_DEMO_LOGIN=1 in verify-live.sh",
        "Add retries for live targets in playwright.config.ts",
        "Run marketing-mobile-nav spec on live web",
        "Run dashboard navigation spec on live app",
        "Capture screenshots via capture-product-screenshots.sh",
        "Commit apps/web/public/screenshots/*.png",
        "Fix capture-screenshots beforeEach login flake",
        "Add e2e test for transaction detail loading state",
        "Add e2e test for settings page skeleton",
        "Test book demo CTA href mailto or https",
        "Assert PUBLIC_SURFACE_FORBIDDEN in marketing specs",
        "Add loginAsUser rate-limit backoff",
        "Serial mode for send-flow describe block",
        "Document flaky tests in INCIDENTS.md",
        "Clear test-results after green run",
        "Add staging-live-cookie-e2e.sh to MEMORY scripts",
        "Validate tryAddDemoFunds on live demo mode",
        "Test ?next= redirect for /dashboard/send",
        "Run full 15-test suite with workers:1",
        "Wire playwright into verify:live only (no subset)",
    ],
    [  # v3 copy
        "Sync packages/shared/src/public-copy.ts from blueprint",
        "Run npm run ci:guards drift scan",
        "Fix CLIENT_COPY usage in apps/app dashboard",
        "Align apps/web marketing copy with PUBLIC_COPY",
        "Remove forbidden strings from marketing pages",
        "Update formatSmeTxStatus for new statuses only via shared",
        "Audit BookDemoLink label from PUBLIC_COPY.ctaDemo",
        "Check Converter.tsx public rate copy",
        "Validate terms/privacy pages load in E2E",
        "Fix typo in dashboard empty states",
        "Ensure no todolist paths in customer bundle",
        "Add drift-prevention test for new marketing phrase",
        "Review ProductScreenshotGallery CLIENT_COPY caption",
        "Audit LoginForm error messages for API unreachable",
        "Check GettingStartedChecklist copy alignment",
        "Validate pricing page fee copy vs shared constants",
        "Scan repo for competitor names in public surfaces",
        "Scan repo for MSB strategy detail in browser code",
        "Update og.svg if public tagline changed",
        "Document copy change flow in agent MEMORY",
        "Fix duplicate copy keys in shared package",
        "Run build web after copy-only change",
        "Add ci-guard for new public-copy export",
        "Cross-check GTM checklist copy references",
        "Never edit todolist/ — note in REGISTRY",
    ],
    [  # v4 api
        "Verify apps/api/src/routes/quote.ts live estimate",
        "Test apps/api/src/routes/transactions.ts list/detail",
        "Harden demo-fund.ts for demo mode only",
        "Validate rates.ts against shared fee constants",
        "Check platform.ts admin endpoints",
        "Test telegram handlers smoke endpoint",
        "Run prisma seed for demo user",
        "Validate auth login rate limit behavior",
        "Fix API JSON errors for login (no HTML)",
        "Test httpOnly cookie set on login",
        "Verify meta/config exposes demo mode flag",
        "Add api health check to smoke script",
        "Test transaction approval threshold logic",
        "Audit Prisma schema for staging pilot fields",
        "Run db:generate after schema touch",
        "Validate Supabase pooler in production DATABASE_URL",
        "Test Circle mock path in quote flow",
        "Document API URL in apps/web and apps/app env",
        "Fix CORS for virlux-web and virlux-app origins",
        "Add unit test in apps/api for critical route",
        "Run npm test -w @virlux/api",
        "Check apps/api/src/app.ts export for Vercel",
        "Validate index.ts serverless entry",
        "Review transactions id route error handling",
        "Sync shared types with API responses",
    ],
    [  # v5 dashboard ux
        "Improve transaction detail page error state",
        "Add DetailSkeleton to settings page",
        "Fix send flow deposit required messaging",
        "Harden KYC page loading state",
        "Improve platform page for demo mode",
        "Add empty state for transactions list",
        "Fix sidebar nav accessible names for E2E",
        "Improve approvals page mobile layout",
        "Add loading skeleton to team page",
        "Validate deposits Add demo funds visibility",
        "Fix dashboard overview quick links",
        "Improve audit log page readability",
        "Add CLIENT_COPY for payments.loadFailed",
        "Add CLIENT_COPY for payments.notFound",
        "Test middleware redirect to ?next= path",
        "Validate router.push after login uses next param",
        "Fix form submit button vs tab Sign in confusion",
        "Improve demo hint on login form",
        "Track analytics event on demo_booked",
        "Validate httpOnly session without JS cookie read",
        "Fix transaction list router navigation",
        "Add focus styles for a11y on send form",
        "Reduce layout shift on dashboard load",
        "Test approval flow UI expand payout section",
        "Run dashboard E2E after UX change",
    ],
    [  # v6 conversion gtm
        "Run npm run verify:book-demo on live web",
        "Add scripts/verify-book-demo.sh href extraction hardening",
        "Document Calendly env in GTM-MEDIA-CHECKLIST",
        "Run smoke:custom-domains; expect lander fail",
        "Point founder to DNS virlux.com → virlux-web",
        "Bundle PNG gallery via static imports",
        "Redeploy web after screenshot capture",
        "Add Loom placeholder section in agent docs",
        "Wire NEXT_PUBLIC_BOOK_DEMO_URL check when set",
        "Run verify:analytics when domain configured",
        "Add Plausible script check to verify-analytics",
        "Improve marketing #product section CTA",
        "Test mobile nav product links E2E",
        "Validate pricing book demo link",
        "Add conversion event tracking hook",
        "Document app.virlux.com wiring for founder",
        "Skip E2E on virlux.com lander stub",
        "Add founder GTM actions pointer in PRIORITY",
        "Capture fresh PNGs after UI change",
        "Verify og image and screenshots in build",
        "Add npm run smoke:custom-domains to verify:full",
        "Echo lander WARN without failing verify:full",
        "Update VIRLUX-PRIORITY T1 founder table",
        "Sync pinned-virlux-gtm-env-ready status",
        "Run conversion hardening regression verify:live",
    ],
    [  # v7 money compliance
        "Document Circle prod key gate for founder",
        "Document FINTRAC copy lock in PRIORITY founder",
        "Audit approval thresholds in prod config",
        "Validate demo mode gates real money paths",
        "Review public-copy for compliance phrases only",
        "Add env guard DEMO_MODE vs production",
        "Test send payment blocked without deposit",
        "Validate maker-checker threshold in approval-flow",
        "Document real-money pins as founder-only",
        "Check rates display matches regulatory copy",
        "Audit transaction status customer strings",
        "Ensure no internal blueprint in API responses",
        "Review KYC flow copy for pilot scope",
        "Add INCIDENT if prod keys almost committed",
        "Scan .gitignore for env and secrets",
        "Validate ci-guards secret patterns",
        "Document FINTRAC in founder checklist only",
        "Test quote estimate disclaimer copy",
        "Review terms page regulatory references",
        "Check privacy policy data retention copy",
        "Add staging flag for Circle sandbox",
        "Document pinned-virlux-real-money-gates backlog",
        "Do not implement prod Circle without founder",
        "Add verify step that demo mode is on live app",
        "Cross-check EXECUTION blueprint via todolist pointer",
    ],
    [  # v8 platform partners
        "Document design partners pilot in PRIORITY",
        "Add outreach template cross-link in agent docs",
        "Improve platform admin page for pilot tenants",
        "Add case study placeholder in marketing",
        "Document 10-logo vertical in founder backlog",
        "Validate demo org seed data",
        "Test team page for multi-user future",
        "Add platform setup script notes to MEMORY",
        "Run staging-platform-setup.sh verification",
        "Document Telegram bot pilot scope",
        "Test /api/telegram/status in smoke",
        "Add founder checklist for partner onboarding",
        "Improve demo login hint for partners",
        "Add BOOK_DEMO funnel for partner calls",
        "Document PILOT-OUTREACH-TEMPLATE path",
        "Validate converter for partner demo",
        "Add partner-specific E2E smoke later flag",
        "Track partner feedback in AUDIT-LOG template",
        "Sync design-partners pin in registry",
        "Do not commit partner PII in repo",
        "Add RBAC research note in T3 prompts",
        "Document vertical pilot FINTRAC scope",
        "Link FOUNDER-GTM-CHECKLIST as read-only",
        "Add case study screenshot to PNG capture list",
        "Run verify:full after platform page change",
    ],
    [  # v9 scale research
        "Research outputFileTracingRoot for app monorepo warning",
        "Evaluate Playwright parallel workers on CI",
        "Research Vercel edge vs node for API routes",
        "Document Railway optional path status blocked",
        "Benchmark web build time after PNG imports",
        "Research rate limit tuning for demo login",
        "Evaluate Redis session store for scale",
        "Research multi-region Supabase for pilot",
        "Document observability gaps for production",
        "Research structured logging for API",
        "Evaluate GitHub Actions cache for verify:live",
        "Research preview deploy per PR",
        "Document mono lockfile warning remediation",
        "Research i18n for CAD SME corridors",
        "Evaluate shared package versioning strategy",
        "Research webhook retries for transactions",
        "Document federation long-horizon in T3",
        "Research agent self-audit automation in CI",
        "Evaluate pick-plan script integration",
        "Research 1000-prompt pack diff vs global library",
        "Compare verify ladder to industry SaaS E2E norms",
        "Document best-model agent workflow (read MEMORY first)",
        "Add CHANGELOG entry for virlux-1000 generation",
        "Validate prompt count equals 1000 locked",
        "Schedule next PLAN WITH NO ASF via pick script",
    ],
]

TIER_DEPTH = {
    "T0": "Do now. Minimal scope. Run verify gate before close.",
    "T1": "Next sprint. Ship with evidence in PRIORITY.md.",
    "T2": "Quarterly hardening. Refactor only if verify stays green.",
    "T3": "Research spike. Document findings in AUDIT-LOG; optional code.",
}

VERIFY = {
    "T0": "npm run verify:full",
    "T1": "npm run verify:live",
    "T2": "npm run deploy:smoke",
    "T3": "npm run agent:self-audit",
}

PINNED_DONE = [
    "pinned-virlux-vercel-api-live",
    "pinned-virlux-ui-copy-upgrade",
    "pinned-virlux-dns-custom-domains",
    "pinned-virlux-vercel-web-app-deploy",
    "pinned-virlux-e2e-playwright",
    "pinned-virlux-png-screenshots",
    "pinned-virlux-live-png-web",
    "pinned-virlux-custom-domain-gtm",
    "pinned-virlux-verify-ladder",
    "pinned-virlux-e2e-stable",
    "pinned-virlux-gtm-env-ready",
    "pinned-virlux-deploy-archive",
    "pinned-virlux-verify-full",
]

PINNED_FOUNDER = [
    ("pinned-virlux-real-money-gates", "Founder: Circle prod, FINTRAC copy lock"),
    ("pinned-virlux-design-partners", "Founder: 10-logo pilot + case study"),
]


def prompt_body(
    pid: str,
    phase: str,
    phase_desc: str,
    tier: str,
    task: str,
    slot: int,
) -> str:
    priority = {"T0": "P0", "T1": "P1", "T2": "P2", "T3": "P3"}[tier]
    agent_prompt = (
        f"PLAN WITH NO ASF — VIRLUX agent prompt {pid}. "
        f"{task} ({TIER_DEPTH[tier]}). "
        f"Pre-flight: read os/agents/auto-virlux-delivery/MEMORY.md and INCIDENTS.md. "
        f"Only edit REGISTRY paths or code; tag docs VIRLUX-AUTO-DELIVERY-YYYYMMDD. "
        f"Post-flight: npm run agent:self-audit and append AUDIT-LOG."
    )
    return f"""---
id: {pid}
phase: {phase}
tier: {tier}
priority: {priority}
status: backlog
lane: virlux
library: virlux-1000-locked
agent: Auto-VIRLUX-Delivery
slot: {slot}
generator: scripts/generate-virlux-1000-prompts.py
locked: true
updated_at: {datetime.now(timezone.utc).strftime("%Y-%m-%d")}
---

# {pid} — {task}

**Phase:** `{phase}` — {phase_desc}  
**Tier:** `{tier}` — {TIER_DEPTH[tier]}

## Agent prompt (copy to chat)

```
{agent_prompt}
```

## Task

{task}

## Sources (read first)

- `os/agents/auto-virlux-delivery/MEMORY.md`
- `os/plan.json` · `os/plan-library/VIRLUX-PRIORITY.md`
- `packages/shared/src/public-copy.ts` (copy SOT surface)
- `todolist/PUBLIC-BLUEPRINT.md` (gitignored — founder sync only)
- Global pack: `~/.cursor/plans/no-asf-library/REGISTRY.json`

## Verify

```bash
{VERIFY[tier]}
```

## Closeout

1. `status: done` in front matter
2. `os/plan-library/VIRLUX-PRIORITY.md` or AUDIT-LOG evidence
3. `bash scripts/sync-virlux-no-asf-registry.sh`
"""


def main() -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    entries: list[dict] = []
    seq = 0

    for p_idx, (phase, phase_desc) in enumerate(PHASES):
        tasks = PHASE_TASKS[p_idx]
        for tier, tier_desc in TIERS:
            tier_dir = PROMPTS / phase / tier
            tier_dir.mkdir(parents=True, exist_ok=True)
            for slot in range(25):
                seq += 1
                pid = f"vx-{seq:04d}"
                task = tasks[slot]
                rel = f"prompts/{phase}/{tier}/{pid}.md"
                path = PACK / rel
                path.write_text(
                    prompt_body(pid, phase, phase_desc, tier, task, slot),
                    encoding="utf-8",
                )
                entries.append(
                    {
                        "id": pid,
                        "phase": phase,
                        "tier": tier,
                        "priority": {"T0": "P0", "T1": "P1", "T2": "P2", "T3": "P3"}[tier],
                        "lane": "virlux",
                        "slot": slot,
                        "title": task[:80],
                        "path": rel,
                        "status": "backlog",
                        "verify": VERIFY[tier],
                        "agent_prompt": (
                            f"PLAN WITH NO ASF — {pid}: {task}"
                        ),
                    }
                )

    pinned = []
    for pin in PINNED_DONE:
        pinned.append({"id": pin, "lane": "virlux", "tier": "T0", "status": "done"})
    for pin, title in PINNED_FOUNDER:
        pinned.append({"id": pin, "lane": "virlux", "tier": "T0", "status": "backlog", "title": title})

    registry = {
        "schema_version": 1,
        "library": "virlux-1000-locked",
        "locked": True,
        "count": len(entries),
        "generated_at": now,
        "agent": "Auto-VIRLUX-Delivery",
        "repo": "VIRLUX",
        "grid": "10 phases × 4 tiers × 25 prompts = 1000",
        "trigger": "PLAN WITH NO ASF",
        "pick_script": "scripts/pick-virlux-no-asf-plan.py",
        "global_pack": str(Path.home() / ".cursor/plans/no-asf-library"),
        "sources": [
            "os/plan.json",
            "os/plan-library/VIRLUX-PRIORITY.md",
            "os/agents/auto-virlux-delivery/MEMORY.md",
            "packages/shared/src/public-copy.ts",
            "todolist/ (gitignored constitution)",
            "~/.cursor/plans/no-asf-library/REGISTRY.json",
        ],
        "phases": [{"id": p, "description": d} for p, d in PHASES],
        "tiers": [{"id": t, "description": d} for t, d in TIERS],
        "pinned": pinned,
        "plans": entries,
    }

    PACK.mkdir(parents=True, exist_ok=True)
    (PACK / "REGISTRY.json").write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")
    assert len(entries) == 1000, f"expected 1000 got {len(entries)}"
    print(f"LOCKED {len(entries)} VIRLUX prompts → {PACK / 'REGISTRY.json'}")


if __name__ == "__main__":
    main()
