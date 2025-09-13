// This script applies the Digital ID database migration
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const migrationFile = path.join(
  __dirname,
  '../supabase/migrations/20250913000005_add_digital_ids_table.sql'
);

// Check if the migration file exists
if (!fs.existsSync(migrationFile)) {
  console.error('Error: Migration file not found at', migrationFile);
  process.exit(1);
}

// Read the SQL file
const sql = fs.readFileSync(migrationFile, 'utf8');

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or key in environment variables');
  process.exit(1);
}

// Use the Supabase CLI to run the migration
const command = `npx supabase migration up --db-url "postgresql://postgres:postgres@localhost:5432/postgres"`;

exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
    return;
  }
  console.log('Migration output:', stdout);
  console.log('✅ Digital ID database migration completed successfully!');
});
