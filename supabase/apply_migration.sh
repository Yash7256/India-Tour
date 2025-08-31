#!/bin/bash

# Load environment variables from .env file
if [ -f "../.env" ]; then
  # Use a temporary file to avoid issues with special characters
  grep -v '^#' ../.env | grep DATABASE_URL > /tmp/db_url.tmp
  source /tmp/db_url.tmp
  rm -f /tmp/db_url.tmp
else
  echo "Error: .env file not found in the project root directory"
  exit 1
fi

# Set database connection parameters from environment variables
DB_URL="$DATABASE_URL"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not found in environment variables"
  exit 1
fi

echo "Applying database migration..."

# Extract connection parameters from URL
DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:[0-9]\+\(:[0-9]\+\)\/.*/\1/p' | cut -d: -f2)
DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Export password for psql
export PGPASSWORD="$DB_PASS"

# Apply migrations in order
for migration in $(ls migrations/*.sql | sort); do
    echo "Applying migration: $migration"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
done

# Verify the migrations were applied
echo "Migrations completed. Verifying changes..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"

echo "If you see your tables listed above, the migration was successful!"
