#!/usr/bin/env bash
# Login via API and write httpOnly session cookies to a jar for curl scripts.
# Usage: COOKIE_JAR=$(mktemp); source scripts/curl-api-login.sh "$API" email pass "$COOKIE_JAR"
set -euo pipefail

API="${1:?API base URL}"
EMAIL="${2:?email}"
PASS="${3:?password}"
JAR="${4:?cookie jar path}"

curl -sS -c "$JAR" -b "$JAR" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" >/dev/null

ME=$(curl -sS -b "$JAR" -c "$JAR" "$API/api/auth/me")
if ! echo "$ME" | jq -e '.email' >/dev/null 2>&1; then
  echo "API login failed: $ME" >&2
  exit 1
fi
