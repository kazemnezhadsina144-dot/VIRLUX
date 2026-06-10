#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260606 | session=d09ef6b2 | date=2026-06-06
# Pick next agent-runnable prompt from VIRLUX 1000 locked pack
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 scripts/pick-virlux-no-asf-plan.py --any-tier --limit "${1:-1}"
