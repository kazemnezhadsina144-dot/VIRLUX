#!/usr/bin/env python3
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260606 | session=d09ef6b2 | date=2026-06-06
"""Pick next VIRLUX 1000 prompt for PLAN WITH NO ASF. Agent-runnable backlog first."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REG = ROOT / "os" / "plan-library" / "virlux-1000" / "REGISTRY.json"

FOUNDER_ONLY = {
    "pinned-virlux-real-money-gates",
    "pinned-virlux-design-partners",
}

SKIP_TASK_SNIPPETS = (
    "Founder:",
    "Circle prod",
    "FINTRAC copy lock in PRIORITY founder",
    "Do not implement prod Circle",
    "todolist/",
    "point founder",
    "Document Circle prod key gate for founder",
    "Document design partners pilot",
)


def agent_runnable(title: str) -> bool:
    t = title.lower()
    return not any(s.lower() in t for s in SKIP_TASK_SNIPPETS)


def main() -> None:
    p = argparse.ArgumentParser(description="Pick VIRLUX 1000 locked prompt")
    p.add_argument("--tier", default="T0")
    p.add_argument("--any-tier", action="store_true")
    p.add_argument("--limit", type=int, default=3)
    p.add_argument("--json", action="store_true")
    args = p.parse_args()

    data = json.loads(REG.read_text())
    tiers = ["T0", "T1", "T2", "T3"] if args.any_tier else [args.tier]

    picked = []
    for tier in tiers:
        for pl in data["plans"]:
            if pl["tier"] != tier or pl.get("status") != "backlog":
                continue
            if not agent_runnable(pl["title"]):
                continue
            picked.append(pl)
            if len(picked) >= args.limit:
                break
        if len(picked) >= args.limit:
            break

    if args.json:
        print(json.dumps(picked, indent=2))
        return

    if not picked:
        print("No agent-runnable backlog — check founder pins or mark vx-* done")
        return

    for pl in picked:
        print(f"{pl['id']}\t{pl['path']}\t{pl['title'][:72]}")
    print("")
    print("Run prompt from file Agent prompt section, then verify:", picked[0]["verify"])


if __name__ == "__main__":
    main()
