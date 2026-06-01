#!/usr/bin/env bash
# Pre-flight checks before starting local dev stack
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="$ROOT/.tools/node/bin:${PATH:-}"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "WARN: DATABASE_URL is set in your shell ($DATABASE_URL)"
  echo "      Run 'unset DATABASE_URL' so apps/api uses .env — stale SQLite URLs break Prisma."
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required for local Postgres (docker compose up -d postgres)"
  exit 1
fi

if ! docker compose ps postgres 2>/dev/null | grep -qE 'running|Up'; then
  echo "Starting Postgres via docker compose..."
  docker compose up -d postgres
fi

echo "Waiting for Postgres..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U virlux -d virlux >/dev/null 2>&1; then
    echo "Postgres ready."
    exit 0
  fi
  sleep 1
done

echo "ERROR: Postgres did not become ready in 30s — run: docker compose logs postgres"
exit 1
