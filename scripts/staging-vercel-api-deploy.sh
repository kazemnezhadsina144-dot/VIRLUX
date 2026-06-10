#!/usr/bin/env bash
# Deploy VIRLUX API to Vercel (virlux-api project) — no Railway token required
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERCEL="npx vercel"
SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  export VERCEL_TOKEN
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Missing .env.staging — run: STAGING_WEB_URL=https://virlux-web.vercel.app STAGING_APP_URL=https://virlux-app.vercel.app bash scripts/staging-prepare-env.sh"
  exit 1
fi

# Keys pushed to Vercel (server-only; skip NEXT_PUBLIC_* — set on web/app separately)
ENV_KEYS=(
  NODE_ENV PORT DATABASE_URL JWT_SECRET JWT_ACCESS_TTL JWT_REFRESH_TTL_DAYS
  AUTO_SETTLE SETTLEMENT_MODE ALLOW_ORG_DEPOSIT_CONFIRM APPROVAL_THRESHOLD
  DEMO_APPROVAL_THRESHOLD DEMO_FUND_ENABLED RATE_LIMIT_MAX AUTH_RATE_LIMIT_MAX
  QUOTE_ESTIMATE_RATE_LIMIT_MAX ALLOW_OPEN_REGISTRATION
  CORS_ORIGINS PLATFORM_ADMIN_EMAILS PLATFORM_ADMIN_MFA_REQUIRED DEPOSIT_WEBHOOK_SECRET
  TELEGRAM_BOT_TOKEN TELEGRAM_BOT_NAME TELEGRAM_MODE TELEGRAM_WEBHOOK_URL
  TELEGRAM_WEBHOOK_SECRET TELEGRAM_ADMIN_CHAT_IDS
  CIRCLE_API_KEY CIRCLE_SANDBOX CIRCLE_WALLET_ID CIRCLE_WEBHOOK_SECRET
)

echo "== Vercel: link virlux-api =="
if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  $VERCEL link --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --project virlux-api >/dev/null 2>&1 || true
else
  $VERCEL link --yes --scope "$SCOPE" --project virlux-api >/dev/null 2>&1 || true
fi

echo "== Vercel: sync server env from .env.staging =="
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^# ]] && continue
  [[ -z "$line" ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$key" ]] && continue
  skip=0
  for k in "${ENV_KEYS[@]}"; do
    [[ "$key" == "$k" ]] || continue
    skip=1
    if [[ "$key" == "DATABASE_URL" && ( "$val" == sqlite:* || "$val" == *"USER:PASS@"* ) ]]; then
      echo "  SKIP DATABASE_URL (set VIRLUX_STAGING_DB_PASSWORD + bash scripts/staging-supabase-db-url.sh)"
      continue
    fi
    if [[ "$key" == "ALLOW_OPEN_REGISTRATION" && "$val" == "true" ]]; then
      echo "  SKIP $key=true (forbidden in production)"
      continue
    fi
    if [[ "$key" == "DEMO_FUND_ENABLED" && "$val" == "true" ]]; then
      echo "  SKIP $key=true (forbidden when NODE_ENV=production on Vercel)"
      continue
    fi
    if [[ "$key" == "AUTO_SETTLE" && "$val" == "true" ]]; then
      echo "  SKIP $key=true (forbidden in production)"
      continue
    fi
    echo "  $key"
    if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
      (cd "$ROOT" && echo "$val" | $VERCEL env add "$key" production "${TOKEN_ARGS[@]}" --scope "$SCOPE" --force 2>/dev/null) || true
    else
      (cd "$ROOT" && echo "$val" | $VERCEL env add "$key" production --scope "$SCOPE" --force 2>/dev/null) || true
    fi
    break
  done
  [[ "$skip" -eq 0 ]] && true
done < "$ROOT/.env.staging"

echo "== Vercel: production-safe defaults =="
for pair in "DEMO_FUND_ENABLED=false" "ALLOW_OPEN_REGISTRATION=false" "AUTO_SETTLE=false" "PLATFORM_ADMIN_EMAILS=contact@virlux.com" "PLATFORM_ADMIN_MFA_REQUIRED=true"; do
  key="${pair%%=*}"
  val="${pair#*=}"
  echo "  $key=$val"
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    (cd "$ROOT" && echo "$val" | $VERCEL env add "$key" production "${TOKEN_ARGS[@]}" --scope "$SCOPE" --force 2>/dev/null) || true
  else
    (cd "$ROOT" && echo "$val" | $VERCEL env add "$key" production --scope "$SCOPE" --force 2>/dev/null) || true
  fi
done

echo "== Vercel: deploy API (production) =="
# Project dashboard may ignore --local-config; swap root vercel.json for API build for this deploy only
cp "$ROOT/vercel.json" "$ROOT/vercel.json.web.bak"
cp "$ROOT/vercel.api.json" "$ROOT/vercel.json"
trap 'mv "$ROOT/vercel.json.web.bak" "$ROOT/vercel.json"' EXIT

if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  $VERCEL "${TOKEN_ARGS[@]}" deploy --yes --archive=tgz --scope "$SCOPE" --project virlux-api --cwd "$ROOT" --prod 2>&1 | tee /tmp/vercel-virlux-api.log | tail -25
else
  $VERCEL deploy --yes --archive=tgz --scope "$SCOPE" --project virlux-api --cwd "$ROOT" --prod 2>&1 | tee /tmp/vercel-virlux-api.log | tail -25
fi

API_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' /tmp/vercel-virlux-api.log | tail -1 || true)
if [[ -z "$API_URL" ]]; then
  API_URL="https://virlux-api.vercel.app"
fi
API_URL="${API_URL%/}"
echo ""
echo "API URL: $API_URL"
echo "Next: bash scripts/staging-wire-production.sh $API_URL"
