#!/usr/bin/env bash
# Build DATABASE_URL for virlux-staging Supabase (requires DB password from dashboard reset)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="${VIRLUX_SUPABASE_REF:-bueoakgiisvufxfbdvoa}"
PASS="${VIRLUX_API_DB_PASSWORD:-${VIRLUX_STAGING_DB_PASSWORD:-}}"

if [[ -z "$PASS" ]]; then
  echo "Set VIRLUX_API_DB_PASSWORD (virlux_api role) or VIRLUX_STAGING_DB_PASSWORD (postgres reset)"
  echo "  bash scripts/staging-supabase-db-url.sh"
  exit 1
fi
# Vercel/serverless: use Supavisor on db host :6543 (IPv4-friendly). Direct :5432 for migrate/seed.
# Override with VIRLUX_STAGING_DB_PASSWORD + postgres.* pooler if using the superuser instead of virlux_api.
APP_PASS="${VIRLUX_API_DB_PASSWORD:-$PASS}"
ENC_PASS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$APP_PASS")
DB_URL="postgresql://virlux_api:${ENC_PASS}@db.${REF}.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://virlux_api:${ENC_PASS}@db.${REF}.supabase.co:5432/postgres"
if [[ -n "${VIRLUX_STAGING_DB_PASSWORD:-}" && -z "${VIRLUX_API_DB_PASSWORD:-}" ]]; then
  ENC_PG=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$VIRLUX_STAGING_DB_PASSWORD")
  REGION="${VIRLUX_SUPABASE_REGION:-ca-central-1}"
  POOL_AWS="${VIRLUX_SUPABASE_POOL_AWS:-1}"
  DB_URL="postgresql://postgres.${REF}:${ENC_PG}@aws-${POOL_AWS}-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  DIRECT_URL="postgresql://postgres:${ENC_PG}@db.${REF}.supabase.co:5432/postgres"
fi

upsert_env() {
  local key="$1" val="$2" file="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${val}|" "$file"
    rm -f "${file}.bak"
  else
    echo "${key}=${val}" >> "$file"
  fi
}

if [[ -f "$ROOT/.env.staging" ]]; then
  upsert_env DATABASE_URL "$DB_URL" "$ROOT/.env.staging"
  upsert_env DIRECT_URL "$DIRECT_URL" "$ROOT/.env.staging"
else
  {
    echo "DATABASE_URL=${DB_URL}"
    echo "DIRECT_URL=${DIRECT_URL}"
  } > "$ROOT/.env.staging"
  chmod 600 "$ROOT/.env.staging"
fi

echo "Updated .env.staging DATABASE_URL (pooler) + DIRECT_URL for project ${REF}"
echo "Run: npm run db:migrate -w @virlux/api && SEED_DATABASE=true npm run db:seed -w @virlux/api"
