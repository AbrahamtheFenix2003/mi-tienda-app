#!/bin/sh
set -euo pipefail

log() {
  echo "[backend] $1"
}

log "Starting backend container..."

DATABASE_URL="${DATABASE_URL:-}"
if [ -z "$DATABASE_URL" ]; then
  log "DATABASE_URL environment variable is not set. Aborting start-up."
  exit 1
fi

connection_data=$(node <<'NODE'
const urlString = process.env.DATABASE_URL;
if (!urlString) {
  process.exit(1);
}
try {
  const url = new URL(urlString);
  const user = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || '5432';
  const dbName = url.pathname.replace(/^\//, '');

  if (!user || !password || !host || !dbName) {
    process.exit(1);
  }

  console.log([user, password, host, port, dbName].join('\n'));
} catch (err) {
  process.exit(1);
}
NODE
)

if [ -z "$connection_data" ]; then
  log "Unable to parse DATABASE_URL. Please verify it has the format postgresql://user:password@host:port/db."
  exit 1
fi

IFS='
' read -r db_user db_password db_host db_port db_name <<EOF
$connection_data
EOF

export PGPASSWORD="$db_password"

max_attempts=30
attempt=0

log "Waiting for PostgreSQL at ${db_host}:${db_port}..."
until psql -h "$db_host" -U "$db_user" -d "$db_name" -p "$db_port" -c '\q' >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    log "PostgreSQL did not respond after ${max_attempts} attempts."
    exit 1
  fi
  log "PostgreSQL not ready yet - retrying (${attempt}/${max_attempts})..."
  sleep 2
done
log "PostgreSQL is ready."

log "Applying Prisma schema..."
if [ -d "prisma/migrations" ] && find prisma/migrations -mindepth 1 -print -quit >/dev/null 2>&1; then
  log "Running prisma migrate deploy..."
  npx --yes prisma migrate deploy --schema=prisma/schema.prisma
else
  log "No migrations found, running prisma db push..."
  npx --yes prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss
fi
log "Prisma schema applied."

log "Executing database seed..."
npm run seed || log "Seed command failed or was already applied; continuing start-up."

log "Start-up complete. Launching application..."
exec "$@"
