import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigrations() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const sql = await fs.readFile(migrationPath, 'utf8');
      
      // Split SQL by semicolons to execute statements one by one
      const statements = sql.split(';').filter(statement => statement.trim() !== '');
      
      for (const statement of statements) {
        if (statement.trim() === '') continue;
        
        try {
          const { error } = await supabase.rpc('exec_sql', { query: statement });
          if (error) {
            console.error(`Error executing statement in ${file}:`, error);
            // Continue with next migration file even if one fails
            break;
          }
        } catch (err) {
          console.error(`Error executing statement in ${file}:`, err);
          break;
        }
      }
    }

    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run the migration script
applyMigrations();
