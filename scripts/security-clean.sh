#!/usr/bin/env bash
# Remove local artifacts that must never ship (sessions, test dumps, build cache).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== security-clean =="

rm -rf test-results playwright-report e2e/.auth 2>/dev/null || true
rm -f vercel.json.web.bak vercel.json.deploy.bak 2>/dev/null || true

for dir in apps/web/.next apps/app/.next apps/api/dist packages/shared/dist; do
  if [[ -d "$dir" ]]; then
    rm -rf "$dir"
    echo "  removed $dir"
  fi
done

# Strip legacy bearer tokens from browser storage files if any exist locally
find "$ROOT/apps" -name '*.local' -path '*/.next/*' -delete 2>/dev/null || true

echo "OK — local security artifacts removed"
echo "  Secrets stay in ~/.sina/secrets.env and .env.staging (gitignored)"
echo "  Run: npm run verify:full"
