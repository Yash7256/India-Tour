import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to database:', error.message);
      return;
    }

    console.log('Successfully connected to database!');
    console.log('Sample place data:', places[0]);

    // Test auth connection
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Error checking auth:', authError.message);
    } else {
      console.log('Auth connection successful!', session ? 'Session exists' : 'No active session');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testConnection();
