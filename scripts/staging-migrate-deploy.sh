#!/usr/bin/env bash
# Deploy pending Prisma migrations on staging (uses DIRECT_URL — not pooler).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"

# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

set -a
# shellcheck disable=SC1091
source "$ROOT/.env.staging"
set +a

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "DIRECT_URL required in .env.staging"
  exit 1
fi

export DATABASE_URL="$DIRECT_URL"

echo "== staging migrate deploy =="
if ! npx prisma migrate deploy; then
  echo "If P3005 (non-empty DB): run each 'migrate resolve --applied' for migrations already live, then re-run."
  exit 1
fi
echo "OK staging migrations"
