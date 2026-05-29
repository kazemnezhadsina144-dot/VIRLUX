#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.tools/node/bin:${PATH:-}"

if ! command -v npm >/dev/null; then
  echo "Node not found. Run: mkdir -p .tools && curl -fsSL https://nodejs.org/dist/v22.14.0/node-v22.14.0-darwin-arm64.tar.gz | tar -xz -C .tools && mv .tools/node-v22.14.0-darwin-arm64 .tools/node"
  exit 1
fi

cd "$ROOT"
[ -f .env ] || cp .env.example .env

# Shell may override .env with old SQLite DATABASE_URL
unset DATABASE_URL

exec bash scripts/dev-local.sh
