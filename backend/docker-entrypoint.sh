#!/usr/bin/env sh
set -e

echo "Running database migrations..."
alembic upgrade head

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  python -m app.seed || echo "Seed skipped (already populated)."
fi

exec "$@"
