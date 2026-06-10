# PLAN WITH NO ASF — VIRLUX entry point

When you say **PLAN WITH NO ASF**, agents use the ecosystem library (not ASF daily card / portfolio dispatch).

## Canonical library (1000 plans)

| Item | Path |
|------|------|
| **Start here** | [`~/.cursor/plans/NO_ASF_LIBRARY.md`](file:///Users/sinakazemnezhad/.cursor/plans/NO_ASF_LIBRARY.md) |
| **1000 plan files** | `~/.cursor/plans/no-asf-library/plans/phase-*/T*/na-*.md` |
| **Machine index** | `~/.cursor/plans/no-asf-library/REGISTRY.json` |
| **Policy** | `~/.cursor/plans/no-asf-library/POLICY.md` |

## VIRLUX slice in this repo

| Item | Path |
|------|------|
| **LOCKED 1000 prompts (agent)** | [`plan-library/VIRLUX-1000-LOCK.md`](plan-library/VIRLUX-1000-LOCK.md) → [`virlux-1000/`](plan-library/virlux-1000/) |
| **Pick next prompt** | `bash scripts/pick-virlux-no-asf-plan.sh` |
| **Lane index (global slice)** | [`plan-library/virlux-registry.json`](plan-library/virlux-registry.json) |
| **Priority queue (curated)** | [`plan-library/VIRLUX-PRIORITY.md`](plan-library/VIRLUX-PRIORITY.md) |
| **Phases & tiers (global)** | [`plan-library/PHASES-AND-TIERS.md`](plan-library/PHASES-AND-TIERS.md) |
| **Sync script** | `bash scripts/sync-virlux-no-asf-registry.sh` |
| **Regenerate VIRLUX 1000** | `npm run plan:virlux-1000:generate` |

### PLAN WITH NO ASF workflow (VIRLUX)

1. `bash scripts/pick-virlux-no-asf-plan.sh 1`
2. Open path under `os/plan-library/virlux-1000/` → run **Agent prompt**
3. Pre-flight: `os/agents/auto-virlux-delivery/MEMORY.md` + `INCIDENTS.md`
4. Implement → `npm run verify:full` → update `AUDIT-LOG` + `VIRLUX-PRIORITY.md`
5. `bash scripts/sync-virlux-no-asf-registry.sh` + `npm run agent:self-audit`

## Organization

- **10 phases** (`phase-0` … `phase-9`) — time horizon / program act
- **4 tiers** (`T0` … `T3`) — urgency (T0 = blocks ship)
- **10 lanes** — one repo each; VIRLUX = `lane: virlux`, root `~/Desktop/VIRLUX`
- **1000 items** = 10 phases × 4 tiers × 25 plans per cell

VIRLUX-heavy work lives in **`phase-6-commercial-lanes`** (plans `na-0601`–`na-0700` when lane cycles to virlux).

## Pinned VIRLUX plans (real roadmap)

Under `~/.cursor/plans/no-asf-library/plans/phase-6-commercial-lanes/T0/pinned-virlux-*.md`:

| Plan | Status |
|------|--------|
| `pinned-virlux-vercel-api-live` | done |
| `pinned-virlux-ui-copy-upgrade` | done |
| `pinned-virlux-dns-custom-domains` | done |
| `pinned-virlux-vercel-web-app-deploy` | done |
| `pinned-virlux-e2e-playwright` | done |
| `pinned-virlux-png-screenshots` | done |
| `pinned-virlux-live-png-web` | done |
| `pinned-virlux-custom-domain-gtm` | done |
| `pinned-virlux-verify-ladder` | done |
| `pinned-virlux-real-money-gates` | backlog |
| `pinned-virlux-design-partners` | backlog |

## After every no-ASF session (agents)

```bash
# Refresh global registry + VIRLUX slice
python3 ~/.cursor/plans/no-asf-library/scripts/generate-no-asf-plans.py
bash ~/.cursor/plans/no-asf-library/scripts/refresh-after-session.sh
bash scripts/sync-virlux-no-asf-registry.sh

# Mark shipped plans: status: done in plan front matter
# Append ~/.cursor/plans/no-asf-library/CHANGELOG.md
# Update os/plan.json next_tasks / done / verify_last
```

## Active delivery state

See [`plan.json`](plan.json) for current `next_tasks`, `done`, and `verify_last`.
