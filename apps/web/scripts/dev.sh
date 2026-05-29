#!/usr/bin/env bash
set -euo pipefail
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$WEB_DIR/../.." && pwd)"
NODE="$ROOT/.tools/node/bin"
export PATH="${NODE:+$NODE:}$PATH"

PORT=3100
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -t -i:"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "Stopping stale process on port $PORT..."
    kill $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

cd "$WEB_DIR"
if [ ! -f ".next/routes-manifest.json" ]; then
  echo "No .next cache — dev server will compile on first request."
fi

echo "Starting marketing site on http://localhost:$PORT"
exec npm run dev
