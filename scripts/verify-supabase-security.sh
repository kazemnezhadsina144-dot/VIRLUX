#!/usr/bin/env bash
# Verify Supabase Data API cannot read application tables (RLS + revoked grants).
set -euo pipefail

REF="${VIRLUX_SUPABASE_REF:-bueoakgiisvufxfbdvoa}"
BASE="https://${REF}.supabase.co/rest/v1"

if [[ -z "${VIRLUX_SUPABASE_ANON_KEY:-}" ]]; then
  echo "SKIP verify:supabase-security — set VIRLUX_SUPABASE_ANON_KEY to run PostgREST probe"
  exit 0
fi

KEY="$VIRLUX_SUPABASE_ANON_KEY"
HDR=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY")

echo "== verify:supabase-security =="
echo "Project: $REF"

# SELECT must not return rows
body=$(curl -sS "${HDR[@]}" "${BASE}/User?select=id,email,passwordHash&limit=1")
if echo "$body" | grep -qE '"email"|"passwordHash"'; then
  echo "FAIL: anon can read User rows via PostgREST"
  echo "$body"
  exit 1
fi
echo "OK  anon SELECT User → no sensitive rows"

# INSERT must be denied
code=$(curl -sS -o /tmp/virlux-postgrest-probe.json -w "%{http_code}" -X POST "${HDR[@]}" \
  -H "Content-Type: application/json" \
  -d '{"id":"probe","email":"probe@test.com","passwordHash":"x","fullName":"x"}' \
  "${BASE}/User")
if [[ "$code" == "201" || "$code" == "200" ]]; then
  echo "FAIL: anon INSERT User returned $code"
  cat /tmp/virlux-postgrest-probe.json
  exit 1
fi
echo "OK  anon INSERT User → denied ($code)"

echo "== verify:supabase-security OK =="
