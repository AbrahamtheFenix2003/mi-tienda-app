#!/bin/sh
set -euo pipefail

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo "[backend] $1"
}

log_error() {
  echo "${RED}[backend ERROR]${NC} $1" >&2
}

log_success() {
  echo "${GREEN}[backend SUCCESS]${NC} $1"
}

log_warning() {
  echo "${YELLOW}[backend WARNING]${NC} $1"
}

log "Starting backend container..."

# Validate DATABASE_URL exists
DATABASE_URL="${DATABASE_URL:-}"
if [ -z "$DATABASE_URL" ]; then
  log_error "DATABASE_URL environment variable is not set. Aborting start-up."
  exit 1
fi

log "DATABASE_URL is set, parsing connection details..."

# Parse DATABASE_URL using Node.js with better error handling
connection_data=$(node <<'NODE'
const urlString = process.env.DATABASE_URL;

if (!urlString) {
  console.error('DATABASE_URL is empty');
  process.exit(1);
}

try {
  const url = new URL(urlString);
  const user = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || '5432';
  const dbName = url.pathname.replace(/^\//, '');

  // Validate all required fields
  if (!user) {
    console.error('Missing username in DATABASE_URL');
    process.exit(1);
  }
  if (!password) {
    console.error('Missing password in DATABASE_URL');
    process.exit(1);
  }
  if (!host) {
    console.error('Missing hostname in DATABASE_URL');
    process.exit(1);
  }
  if (!dbName) {
    console.error('Missing database name in DATABASE_URL');
    process.exit(1);
  }

  // Output connection details separated by pipes for easier parsing
  console.log(`${user}|${password}|${host}|${port}|${dbName}`);

} catch (err) {
  console.error('Failed to parse DATABASE_URL:', err.message);
  console.error('Expected format: postgresql://user:password@host:port/database');
  process.exit(1);
}
NODE
)

# Check if parsing was successful
if [ $? -ne 0 ] || [ -z "$connection_data" ]; then
  log_error "Unable to parse DATABASE_URL. Please verify it has the format postgresql://user:password@host:port/db."
  exit 1
fi

# Parse the connection data using pipe delimiter
db_user=$(echo "$connection_data" | cut -d'|' -f1)
db_password=$(echo "$connection_data" | cut -d'|' -f2)
db_host=$(echo "$connection_data" | cut -d'|' -f3)
db_port=$(echo "$connection_data" | cut -d'|' -f4)
db_name=$(echo "$connection_data" | cut -d'|' -f5)

# Validate parsed values
if [ -z "$db_user" ] || [ -z "$db_password" ] || [ -z "$db_host" ] || [ -z "$db_port" ] || [ -z "$db_name" ]; then
  log_error "Failed to extract connection details from DATABASE_URL"
  log_error "User: ${db_user:-EMPTY}, Host: ${db_host:-EMPTY}, Port: ${db_port:-EMPTY}, Database: ${db_name:-EMPTY}"
  exit 1
fi

log "Connection details parsed successfully:"
log "  Host: $db_host"
log "  Port: $db_port"
log "  Database: $db_name"
log "  User: $db_user"

export PGPASSWORD="$db_password"

max_attempts=60
attempt=0
sleep_time=2

log "Waiting for PostgreSQL at ${db_host}:${db_port}..."

# Wait for PostgreSQL to be ready
until psql -h "$db_host" -U "$db_user" -d "postgres" -p "$db_port" -c '\q' >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    log_error "PostgreSQL did not respond after ${max_attempts} attempts (${max_attempts}x${sleep_time}s = $((max_attempts * sleep_time))s total)."
    log_error "Please check:"
    log_error "  1. PostgreSQL container is running"
    log_error "  2. DATABASE_URL is correct"
    log_error "  3. Network connectivity between containers"
    log_error "  4. PostgreSQL logs for errors"
    exit 1
  fi
  log "PostgreSQL not ready yet - retrying (${attempt}/${max_attempts})..."
  sleep "$sleep_time"
done

log_success "PostgreSQL is ready and accepting connections."

# Verify target database exists or can be created
log "Verifying database '$db_name' exists..."
if ! psql -h "$db_host" -U "$db_user" -d "postgres" -p "$db_port" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$db_name"; then
  log_warning "Database '$db_name' does not exist. It should be created by migrations or db push."
fi

log "Applying Prisma schema..."

# Count actual migration folders (excluding _baseline if exists)
migration_count=0
if [ -d "prisma/migrations" ]; then
  migration_count=$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d ! -name "_baseline" 2>/dev/null | wc -l)
fi

if [ "$migration_count" -gt 0 ]; then
  log "Found $migration_count migration(s), running prisma migrate deploy..."

  # Try migrate deploy first
  if npx --yes prisma migrate deploy --schema=prisma/schema.prisma 2>&1 | tee /tmp/migrate-output.log; then
    log_success "Prisma migrations applied successfully."
  else
    # Check if error is P3005 (database not empty, needs baseline)
    if grep -q "P3005" /tmp/migrate-output.log; then
      log_warning "Database already has schema. This is normal for existing databases."
      log "Checking if schema matches..."

      # Use db push with --accept-data-loss to sync any differences
      if npx --yes prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss; then
        log_success "Database schema synchronized successfully."
      else
        log_error "Failed to synchronize database schema!"
        exit 1
      fi
    else
      log_error "Prisma migrate deploy failed with unexpected error!"
      cat /tmp/migrate-output.log
      exit 1
    fi
  fi
else
  log "No migrations found in prisma/migrations, using prisma db push..."
  log_warning "For production, consider creating migrations instead of using db push."

  if npx --yes prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss; then
    log_success "Prisma db push completed successfully."
  else
    log_error "Prisma db push failed!"
    exit 1
  fi
fi

# Clean up temporary file
rm -f /tmp/migrate-output.log

log "Executing database seed..."
if npm run seed; then
  log_success "Database seeded successfully."
else
  log_warning "Seed command failed or was already applied; continuing start-up."
fi

log_success "Start-up complete. Launching application..."
exec "$@"
