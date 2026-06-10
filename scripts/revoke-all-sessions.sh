#!/usr/bin/env bash
# Revoke every refresh token (force re-login) — use after credential rotation or INC-009.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Missing .env.staging with DIRECT_URL or DATABASE_URL"
  exit 1
fi

set -a
# shellcheck disable=SC1091
. "$ROOT/.env.staging"
set +a

DB="${DIRECT_URL:-${DATABASE_URL:-}}"
if [[ -z "$DB" || "$DB" == *"USER:PASS@"* ]]; then
  echo "Set DIRECT_URL in .env.staging (pooler breaks some DDL)"
  exit 1
fi

echo "== Revoke all refresh tokens =="
echo "Database: ${DB%%@*}@…"
if [[ "${SECURITY_REVOKE_CONFIRM:-}" != "REVOKE" ]]; then
  echo "Set SECURITY_REVOKE_CONFIRM=REVOKE to run (destructive — forces all users to re-login)"
  exit 1
fi

DATABASE_URL="$DB" npx prisma db execute --stdin --schema "$ROOT/apps/api/prisma/schema.prisma" <<'SQL'
UPDATE "RefreshToken" SET "revokedAt" = NOW() WHERE "revokedAt" IS NULL;
SQL

echo "OK — all refresh tokens revoked"
