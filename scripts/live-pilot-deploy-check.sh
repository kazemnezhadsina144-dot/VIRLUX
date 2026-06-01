#!/usr/bin/env bash
# Pre-flight check before live deploy (founder)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Live Pilot deploy pre-flight =="
missing=0

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "WARN: RAILWAY_TOKEN not set"
  missing=$((missing + 1))
fi
if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "WARN: VERCEL_TOKEN not set"
  missing=$((missing + 1))
fi

if [[ -f .env.staging ]]; then
  echo "OK: .env.staging exists"
else
  echo "WARN: run bash scripts/staging-prepare-env.sh"
  missing=$((missing + 1))
fi

bash scripts/staging-validate-env.sh 2>/dev/null || echo "NOTE: staging-validate-env needs .env.staging with real URLs"

echo ""
echo "Next: see docs/LIVE-DEPLOY-RUNBOOK.md"
if [[ $missing -gt 0 ]]; then
  echo "Set founder tokens and re-run deploy."
  exit 1
fi
echo "Tokens present — run: RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all"
