#!/usr/bin/env bash
# Sync VIRLUX lane rows from global no-ASF library into os/plan-library/virlux-registry.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GLOBAL="${NO_ASF_LIBRARY:-$HOME/.cursor/plans/no-asf-library}"
REG="$GLOBAL/REGISTRY.json"
OUT="$ROOT/os/plan-library/virlux-registry.json"

if [[ ! -f "$REG" ]]; then
  echo "Missing $REG — run: python3 $GLOBAL/scripts/generate-no-asf-plans.py"
  exit 1
fi

python3 - "$REG" "$OUT" "$ROOT/os/plan.json" <<'PY'
import json, sys
from datetime import datetime, timezone

reg_path, out_path, plan_json = sys.argv[1:4]
reg = json.loads(open(reg_path).read())
plans = [p for p in reg.get("plans", []) if p.get("lane") == "virlux"]
pinned = [p for p in reg.get("pinned", []) if p.get("lane") == "virlux" or str(p.get("id", "")).startswith("pinned-virlux")]

# Include pinned VIRLUX files not yet in registry pinned list
extra_pinned = [
    "pinned-virlux-vercel-api-live",
    "pinned-virlux-ui-copy-upgrade",
    "pinned-virlux-dns-custom-domains",
    "pinned-virlux-e2e-playwright",
    "pinned-virlux-vercel-web-app-deploy",
    "pinned-virlux-png-screenshots",
    "pinned-virlux-live-png-web",
    "pinned-virlux-custom-domain-gtm",
    "pinned-virlux-verify-ladder",
    "pinned-virlux-e2e-stable",
    "pinned-virlux-gtm-env-ready",
    "pinned-virlux-deploy-archive",
    "pinned-virlux-verify-full",
    "pinned-virlux-real-money-gates",
    "pinned-virlux-design-partners",
]
known = {p["id"] for p in pinned}
for pid in extra_pinned:
    if pid not in known:
        pinned.append({"id": pid, "lane": "virlux", "phase": "phase-6-commercial-lanes", "tier": "T0", "status": "backlog"})

# Curated status overrides (VIRLUX delivery evidence — see os/plan-library/VIRLUX-PRIORITY.md)
pinned_status = {
    "pinned-virlux-vercel-api-live": "done",
    "pinned-virlux-ui-copy-upgrade": "done",
    "pinned-virlux-dns-custom-domains": "done",
    "pinned-virlux-vercel-web-app-deploy": "done",
    "pinned-virlux-e2e-playwright": "done",
    "pinned-virlux-png-screenshots": "done",
    "pinned-virlux-live-png-web": "done",
    "pinned-virlux-custom-domain-gtm": "done",
    "pinned-virlux-verify-ladder": "done",
    "pinned-virlux-e2e-stable": "done",
    "pinned-virlux-gtm-env-ready": "done",
    "pinned-virlux-deploy-archive": "done",
    "pinned-virlux-verify-full": "done",
    "pinned-virlux-real-money-gates": "backlog",
    "pinned-virlux-design-partners": "backlog",
}
for p in pinned:
    if p["id"] in pinned_status:
        p["status"] = pinned_status[p["id"]]

os_plan = json.loads(open(plan_json).read()) if open(plan_json).read().strip() else {}

out = {
    "schema_version": 1,
    "lane": "virlux",
    "repo": "VIRLUX",
    "synced_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "global_library": reg_path,
    "global_count": reg.get("count", 1000),
    "virlux_plan_count": len(plans),
    "delivery": {
        "active_focus": os_plan.get("active_focus"),
        "next_tasks": os_plan.get("next_tasks", []),
        "verify_last": os_plan.get("verify_last"),
    },
    "pinned": pinned,
    "plans": plans,
}
open(out_path, "w").write(json.dumps(out, indent=2) + "\n")
print(f"Wrote {len(plans)} virlux plans + {len(pinned)} pinned → {out_path}")
PY

echo "Priority queue: $ROOT/os/plan-library/VIRLUX-PRIORITY.md"
