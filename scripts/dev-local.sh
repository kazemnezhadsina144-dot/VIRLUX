#!/usr/bin/env bash
# Safe local dev — free ports 3100/3001/3002 before starting the full stack
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORTS=(3100 3001 3002)

export PATH="$ROOT/.tools/node/bin:${PATH:-}"

for PORT in "${PORTS[@]}"; do
  if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -t -i:"$PORT" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
      echo "Stopping stale process on port $PORT (pid: $PIDS)..."
      kill $PIDS 2>/dev/null || true
      sleep 1
    fi
  fi
done

cd "$ROOT"
[ -f .env ] || cp .env.example .env
unset DATABASE_URL

echo "Starting VIRLUX stack (web:3100, app:3001, api:3002)..."
exec npm run dev:stack
