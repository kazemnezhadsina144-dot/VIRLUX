# VIRLUX plan library (no-ASF slice)

This folder is the **repo-local view** of the global **1000-plan no-ASF library**.

- **Global library:** `~/.cursor/plans/no-asf-library/` (all lanes, all phases)
- **This folder:** VIRLUX lane filter + curated priority queue

## Files

| File | Purpose |
|------|---------|
| [`PHASES-AND-TIERS.md`](PHASES-AND-TIERS.md) | Phase 0–9 and tier T0–T3 definitions |
| [`VIRLUX-PRIORITY.md`](VIRLUX-PRIORITY.md) | Founder-facing next moves (curated, updated) |
| [`virlux-registry.json`](virlux-registry.json) | All registry rows where `lane === "virlux"` |

## Refresh

```bash
bash scripts/sync-virlux-no-asf-registry.sh
```

Run after any **PLAN WITH NO ASF** session or when `os/plan.json` changes.
