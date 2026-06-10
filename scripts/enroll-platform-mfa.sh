#!/usr/bin/env bash
# Enroll TOTP for a platform admin (staging/production). Stores backup secret in Tier-3 vault.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

API="${VIRLUX_API_URL:-${NEXT_PUBLIC_API_URL:-https://virlux-api.vercel.app}}"
if [[ "$API" == *localhost* || "$API" == *127.0.0.1* ]]; then
  API="https://virlux-api.vercel.app"
fi
EMAIL="${PLATFORM_ADMIN_EMAIL:-contact@virlux.com}"
PASS="${PLATFORM_ADMIN_PASSWORD:-${DEMO_SEED_PASSWORD:-${E2E_DEMO_PASSWORD:-}}}"
FORCE="${MFA_ENROLL_FORCE:-}"

if [[ "$EMAIL" == "demo@virlux.com" && "$FORCE" != "1" ]]; then
  echo "Refusing to enroll demo@virlux.com — breaks live E2E. Use contact@virlux.com or MFA_ENROLL_FORCE=1."
  exit 1
fi

if [[ -z "$PASS" ]]; then
  echo "Set PLATFORM_ADMIN_PASSWORD or DEMO_SEED_PASSWORD (min 12 chars)"
  exit 1
fi

echo "== Enroll MFA for $EMAIL =="
echo "API: $API"
echo ""

COOKIE_JAR="$(mktemp)"
TMP="$(mktemp)"
trap 'rm -f "$COOKIE_JAR" "$TMP"' EXIT

node -e "console.log(JSON.stringify({ email: process.argv[1], password: process.argv[2] }))" "$EMAIL" "$PASS" >"$TMP"
login=$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  --data-binary @"$TMP")

if echo "$login" | grep -q '"error"'; then
  echo "Login failed: $login"
  echo "Tip: contact@virlux.com may not exist in seed — use demo@virlux.com or create the user first."
  exit 1
fi

status=$(curl -sS -b "$COOKIE_JAR" "$API/api/auth/mfa/status")
if echo "$status" | grep -q '"enrolled":true'; then
  echo "Already enrolled for $EMAIL"
  exit 0
fi

setup=$(curl -sS -b "$COOKIE_JAR" -X POST "$API/api/auth/mfa/setup" -H "Content-Type: application/json")
printf '%s' "$setup" >"$TMP"
secret=$(node -e "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!j.secret) process.exit(1); process.stdout.write(j.secret)" <"$TMP")
uri=$(node -e "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(j.uri||'')" <"$TMP")

code=$(node -e "const { generateSync } = require('otplib'); process.stdout.write(generateSync({ secret: process.argv[1] }));" "$secret")

node -e "console.log(JSON.stringify({ secret: process.argv[1], code: process.argv[2] }))" "$secret" "$code" >"$TMP"
activate=$(curl -sS -b "$COOKIE_JAR" -X POST "$API/api/auth/mfa/activate" \
  -H "Content-Type: application/json" \
  --data-binary @"$TMP")

if ! echo "$activate" | grep -q '"ok":true'; then
  echo "Activate failed: $activate"
  exit 1
fi

SECRETS="${SINA_SECRETS_FILE:-$HOME/.sina/secrets.env}"
var="PLATFORM_ADMIN_MFA_SECRET_${EMAIL//@/_AT_}"
var="${var//./_}"
mkdir -p "$(dirname "$SECRETS")"
touch "$SECRETS"
chmod 600 "$SECRETS"
if grep -q "^${var}=" "$SECRETS" 2>/dev/null; then
  sed -i.bak "s|^${var}=.*|${var}=${secret}|" "$SECRETS" && rm -f "${SECRETS}.bak"
else
  echo "${var}=${secret}" >> "$SECRETS"
fi

echo "OK — MFA enrolled for $EMAIL"
echo "Authenticator URI (scan once): $uri"
echo "Backup secret saved to ${SECRETS} as ${var}"
echo ""
echo "Do NOT set PLATFORM_ADMIN_MFA_REQUIRED=true until every PLATFORM_ADMIN_EMAILS account is enrolled."
echo "Staging: keep MFA optional so demo@ E2E stays green unless E2E sends totpCode."
