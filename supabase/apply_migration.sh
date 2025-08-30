#!/bin/bash

# Set database connection parameters
DB_HOST="db.oieprqcpiictuqskjuaq.supabase.co"
DB_PORT=5432
DB_NAME="postgres"
DB_USER="postgres"
DB_PASS="#Aman1006@"  # Note: Special characters are properly escaped

# Export password for psql
PGPASSWORD="$DB_PASS"

echo "Applying database migration..."

# Apply the migration
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f supabase/migrations/20250830000001_improve_schema.sql

# Verify the migration was applied
echo "Migration completed. Verifying changes..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

echo "If you see your tables listed above, the migration was successful!"
