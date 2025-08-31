import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function listTables() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute a query to list all tables
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) throw error;

    console.log('Tables in the database:');
    console.log(data.map(t => t.tablename).join('\n'));
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

// Run the function
listTables();
