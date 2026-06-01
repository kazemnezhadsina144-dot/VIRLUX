#!/usr/bin/env bash
# Safe local dev — preflight, free ports 3100/3001/3002, start full stack
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORTS=(3100 3001 3002)

export PATH="$ROOT/.tools/node/bin:${PATH:-}"

bash "$ROOT/scripts/dev-preflight.sh"

for PORT in "${PORTS[@]}"; do
  if command -v lsof >/dev/null 2>&1; then
    for _ in 1 2 3 4 5; do
      PIDS=$(lsof -t -i:"$PORT" 2>/dev/null || true)
      [ -z "$PIDS" ] && break
      echo "Stopping stale process on port $PORT (pid: $PIDS)..."
      kill -9 $PIDS 2>/dev/null || true
      sleep 1
    done
    if lsof -t -i:"$PORT" >/dev/null 2>&1; then
      echo "ERROR: port $PORT still in use — run: lsof -i :$PORT"
      exit 1
    fi
  fi
done

cd "$ROOT"
unset DATABASE_URL

echo "Starting VIRLUX stack (web:3100, app:3001, api:3002)..."
exec npm run dev:stack
