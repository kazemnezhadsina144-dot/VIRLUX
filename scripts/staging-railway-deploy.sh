#!/usr/bin/env bash
# Deploy VIRLUX API + Postgres to Railway (requires RAILWAY_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "Set RAILWAY_TOKEN (https://railway.com/account/tokens)"
  exit 1
fi

export RAILWAY_TOKEN
RAILWAY="npx railway"

echo "== Railway: create project =="
$RAILWAY init --name virlux-staging 2>/dev/null || true

echo "== Railway: add Postgres =="
$RAILWAY add --database postgres 2>/dev/null || $RAILWAY add -d postgres

echo "== Railway: set API env from .env.staging =="
if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Missing .env.staging — run: bash scripts/staging-prepare-env.sh"
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^# ]] && continue
  [[ -z "$line" ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$key" ]] && continue
  $RAILWAY variables set "$key=$val" 2>/dev/null || true
done < "$ROOT/.env.staging"

echo "== Railway: deploy API =="
$RAILWAY up --detach --service api 2>/dev/null || $RAILWAY up --detach

echo ""
echo "API URL:"
$RAILWAY domain 2>/dev/null || echo "  Set public domain in Railway dashboard, then update .env.staging CORS + Vercel vars"
