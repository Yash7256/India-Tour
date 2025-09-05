import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { setTimeout as sleep } from 'timers/promises';

// Make fetch available globally with better error handling
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying fetch (${retries} attempts left)...`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
};

globalThis.fetch = fetchWithRetry;

// Load environment variables from .env file
dotenv.config({ path: new URL('file://' + process.cwd() + '/.env') });

// Debug: Log environment variables (remove in production)
console.log('Environment variables loaded:', {
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  hasPexelsKey: !!process.env.PEXELS_API_KEY
});

// Configuration
const BATCH_SIZE = 5; // Process places in smaller batches to avoid rate limiting
const DELAY_BETWEEN_REQUESTS_MS = 1200; // 1.2 second delay between API calls (Pexels limit: 200 requests per hour)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const openverseToken = process.env.OPENVERSE_ACCESS_TOKEN;

// Check for required environment variables
const missingVars = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingVars.forEach(v => console.error(`  - ${v}`));
  console.log('\nPlease add these to your .env file. You can find them in your Supabase project settings.');
  process.exit(1);
}

// API key checks are now handled within the search function

// Initialize Supabase clients with proper error handling
let supabase, supabaseAdmin;
try {
  // Client for read operations (anon key)
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  });
  
  // Admin client for write operations (service role key)
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Service role key not found in environment variables');
  }
  
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  });
  
  console.log('✅ Supabase clients initialized');
  
  // Test read operation
  const { data: testData, error: testError } = await supabase
    .from('places')
    .select('*')
    .limit(1);
    
  if (testError) throw testError;
  console.log('✅ Successfully connected to Supabase database');
  
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error.message);
  console.log('\nPlease check your Supabase credentials in the .env file');
  console.log('You can find these in your Supabase project settings > API');
  process.exit(1);
}

/**
 * Search for an image using Pexels API
 * @param {string} query - The search query
 * @returns {Promise<string>} - URL of the found image or default image
 */
async function searchImage(query) {
  const pexelsKey = process.env.PEXELS_API_KEY;
  
  if (!pexelsKey) {
    console.log('⚠️ No Pexels API key provided, using default image');
    return DEFAULT_IMAGE;
  }
  
  try {
    // Clean up the query
    const cleanQuery = query
      .replace(/[^\w\s]/gi, ' ') // Remove special characters
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .trim()
      .split(' ')
      .filter(word => word.length > 2) // Keep slightly shorter words for better search
      .join('+');
    
    const searchQuery = `${cleanQuery}+india+tourism`;
    console.log(`🔍 Searching Pexels for: "${searchQuery.replace(/\+/g, ' ')}"`);
    
    const url = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=1&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': pexelsKey,
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Pexels API error (${response.status} ${response.statusText}):`, errorText);
      return DEFAULT_IMAGE;
    }
    
    const data = await response.json();
    
    if (!data || !data.photos || data.photos.length === 0) {
      console.log('ℹ️ No images found for query, using default image');
      return DEFAULT_IMAGE;
    }
    
    // Get the first result's URL (preferring large images if available)
    const photo = data.photos[0];
    const imageUrl = photo.src?.original || 
                    photo.src?.large2x || 
                    photo.src?.large ||
                    photo.src?.medium;
    
    if (!imageUrl) {
      console.log('⚠️ No image URL found in response, using default image');
      return DEFAULT_IMAGE;
    }
    
    console.log(`✅ Found image: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('❌ Error searching Pexels:', error.message);
    return DEFAULT_IMAGE;
  }
}

/**
 * Process a batch of places and update their images
 * @param {Array} places - Array of place objects
 */
async function processPlacesBatch(places) {
  for (const place of places) {
    try {
      console.log(`Processing: ${place.name} (${place.city}, ${place.state})`);
      
      // Create a search query using place name, city, and state
      const searchQuery = `${place.name} ${place.city || ''} ${place.state || ''} ${place.category || ''} India tourism landmark`;
      
      // Get image URL from Openverse
      const imageUrl = await searchImage(searchQuery);
      
      // Update the place in the database using admin client
      const { error } = await supabaseAdmin
        .from('places')
        .update({ 
          main_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', place.id);
      
      if (error) {
        console.error(`Error updating place ${place.id}:`, error.message);
      } else {
        console.log(`✅ Updated: ${place.name} - ${imageUrl}`);
      }
      
      // Be nice to the API
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
      
    } catch (error) {
      console.error(`Error processing place ${place.id}:`, error.message);
    }
  }
}

/**
 * Main function to update places with images
 */
async function main() {
  console.log('🚀 Starting to update places with images...');
  
  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    const { count, error: testError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true });
      
    if (testError) throw testError;
    console.log(`✅ Connected to Supabase. Found ${count} total places.`);

    // Specific place IDs to update
    const placeIdsToUpdate = [
      'c47ecb45-229e-466e-b8ff-4d16ce982500', 'c48bd1ed-519d-44e4-8706-ecc806724e66',
      'c5aef21b-5e46-4256-b1a3-01958a338e97', 'c819e357-9783-427d-be2a-18755fce1c13',
      'c883ba63-d205-45af-901b-cb3c63b24522', 'c93125d3-5ae9-475a-96fb-eca3020e00af',
      'c9c43ead-f6e5-4fc2-b945-a5e99f9b64f9', 'cae2ee1f-c934-47df-ab71-6352fc780346',
      'cb47296e-9977-482d-bb43-70f41a6c11b8', 'cd8fe563-bff9-4c6f-b646-93ca9a00dc42',
      'cd97db7d-2a84-47db-8dfe-4b84e8f0299a', 'cddbbfb5-67be-484f-8458-a81a10558b02',
      'cef539a9-6a51-4a46-b4d0-8bd92e1d72d4', 'cfa2aebb-8cc6-421c-8a2f-c0dcbde7c05e',
      'd0746333-5432-4453-9a84-21962d2a6abb', 'd2970d17-78cc-49c2-863f-1b88955e8917',
      'd44985ad-09d9-4c77-85a8-3aae0aca8974', 'd6920285-0fab-4084-944a-bc9274635b3b',
      'e2c4774a-e0c4-4182-8311-4303102694be', 'e3944e63-644c-4bab-9082-98cdc98e3b17',
      'e4897fcc-fd0b-4dbe-82cd-9ad6301d7fc1', 'e5057aa4-f59b-4d08-9f0a-466933d35a93',
      'e505a6fc-15b6-4c40-9a14-6acef4f6296b', 'e55ab3d3-46b6-494d-a99e-f42d2cf1d4fc',
      'e61dcad0-3b8e-42fd-9720-2168dfcfe8ed', 'e6352b7c-1931-4b3b-a493-8c222910b795',
      'e73fdf51-6fe2-447a-b45c-314e4c383590', 'e748bfc9-c56d-4bdd-8bfb-4a68cf39c586',
      'e8898439-d9a6-45f6-a0d7-8622f6569bf0', 'e94f1a39-32f9-4e44-a987-b0b0b49ffc29',
      'e9dc96eb-3d72-460c-8888-8862802b7240', 'ea045cce-e422-4a35-8812-6dc54c7b70f1',
      'eb2b785b-fc2c-47c4-aef4-245d9c23c613', 'eb78dc33-9ca3-49e4-807a-6ef1324e8d4c',
      'ed4fe79c-eb05-4803-9bcf-9d5a97a629a1', 'ef2e66d8-5a52-42c9-8bd9-f8a57ed3a79f',
      'efbdcedc-de3f-42d3-a39b-e77f3dfd02d8', 'f2682aba-cd3d-41ef-a7cc-04499ef73419',
      'f2e45cd2-0cca-4fcc-a548-6189aba38543', 'f4534037-13cd-406b-8ff9-4d9f8d2eed17',
      'f4948688-a405-4754-94ca-83e689a6656e', 'f4c038b4-5da6-4281-b04f-e350b4e82e4f',
      'f4d3057a-5981-44e8-9319-a5f6aa5af025', 'f601671c-8036-4ef7-8eab-59610da835a5',
      'f610eb09-9b8e-4a46-aaf4-8575124776db', 'f84c7fe8-d5e9-4fd6-80d9-17e6bf5b496a',
      'f8baf2f4-8146-4c5a-a2b2-e1cae8aeff6b', 'fab3d587-0682-44eb-9173-286bf2adcff4',
      'fbd15b49-0745-4bf7-af65-adb366308159', 'fbde0b2f-75fa-445b-8e94-9d6f64e19940',
      'fcc49f1d-ea02-43c2-947f-5390275a5fee', 'fe2ea498-dc08-4298-abc7-8911813651ed',
      'fec94682-e692-428e-a6ff-01962289fc78', 'ff33d19a-1c9b-4b43-ba3a-ff17ac2b7bf5'
    ];
    
    console.log(`Fetching ${placeIdsToUpdate.length} specific places to update...`);
    const { data: places, error } = await supabase
      .from('places')
      .select('id, name, city, state, category, main_image_url')
      .in('id', placeIdsToUpdate);
    
    if (error) throw error;
    
    if (!places || places.length === 0) {
      console.log('✅ All places already have Pexels images!');
      return;
    }
    
    console.log(`Found ${places.length} places to update with new images.`);
    
    // Process places in batches
    for (let i = 0; i < places.length; i += BATCH_SIZE) {
      const batch = places.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(places.length / BATCH_SIZE)}`);
      
      await processPlacesBatch(batch);
      
      // Add a small delay between batches
      if (i + BATCH_SIZE < places.length) {
        console.log('Waiting before next batch...');
        await sleep(2000);
      }
    }
    
    console.log('\n🎉 All places have been processed!');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
