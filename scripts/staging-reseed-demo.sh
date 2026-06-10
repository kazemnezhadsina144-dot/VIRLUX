#!/usr/bin/env bash
# Apply Prisma migrations + re-seed demo accounts on staging (requires DIRECT_URL in .env.staging).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"

# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Missing .env.staging — run: npm run staging:supabase-db"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$ROOT/.env.staging"
set +a

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "DIRECT_URL required in .env.staging for migrate deploy"
  exit 1
fi

echo "== staging DB migrate =="
bash "$ROOT/scripts/staging-migrate-deploy.sh"

if [[ -z "${DEMO_SEED_PASSWORD:-}" || ${#DEMO_SEED_PASSWORD} -lt 12 ]]; then
  echo "SKIP re-seed — set DEMO_SEED_PASSWORD (min 12 chars) in ~/.sina/secrets.env"
  exit 0
fi

echo "== staging demo re-seed =="
cd "$ROOT"
SEED_DATABASE=true DEMO_SEED_PASSWORD="$DEMO_SEED_PASSWORD" npm run db:seed -w @virlux/api
echo "OK — demo passwords updated from DEMO_SEED_PASSWORD"
