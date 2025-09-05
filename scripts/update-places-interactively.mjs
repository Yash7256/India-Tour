import { createClient } from '@supabase/supabase-js';
import prompts from 'prompts';
import 'dotenv/config';

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

// --- City to Update ---
// Change this value to focus on a specific city.
// Set to null to process all cities.
const CITY_TO_UPDATE = 'Jabalpur';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Error: Missing Supabase environment variables. Make sure to create a .env file with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

if (!unsplashAccessKey) {
  console.warn(
    '⚠️ Warning: Missing UNSPLASH_ACCESS_KEY. The script will run without automatic image suggestions.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // This is important for a script. It prevents Supabase from trying to store a session.
    persistSession: false,
  },
});

// From your improve_schema.sql
const PLACE_CATEGORIES = [
  'beach', 'mountain', 'heritage', 'temple', 'adventure',
  'wildlife', 'hill_station', 'pilgrimage', 'desert', 'backwaters',
  'museum'
];

const categoryKeywords = {
  heritage: ['fort', 'palace', 'mahal', 'historical', 'ruins', 'monument', 'gate', 'tomb', 'stupa', 'caves'],
  temple: ['temple', 'mandir', 'dargah', 'shrine', 'church', 'mosque', 'gurudwara', 'matha'],
  pilgrimage: ['pilgrimage', 'jyotirlinga', 'dham', 'holy'],
  wildlife: ['national park', 'sanctuary', 'wildlife', 'tiger reserve', 'zoo', 'biosphere'],
  adventure: ['trekking', 'rafting', 'adventure', 'boating', 'falls', 'waterfall', 'hot spring'],
  mountain: ['mountain', 'peak', 'pass', 'hills', 'valley'],
  hill_station: ['hill station'],
  beach: ['beach', 'coast', 'seashore'],
  desert: ['desert', 'sand dunes'],
  backwaters: ['backwaters', 'lake', 'river', 'dam', 'reservoir'],
  museum: ['museum'],
};

/**
 * Searches for an image on Unsplash.
 * @param {string} query The search query.
 * @returns {Promise<string|null>} The URL of the found image or null.
 */
async function searchUnsplashImage(query) {
  if (!unsplashAccessKey) return null;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${unsplashAccessKey}` },
    });
    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (e) {
    console.error('Error searching Unsplash:', e);
    return null;
  }
}

/**
 * Guesses the category of a place based on its name and description.
 * @param {{name: string, description?: string}} place The place object.
 * @returns {string|null} The guessed category or null.
 */
function guessCategory(place) {
  const text = `${place.name.toLowerCase()} ${place.description?.toLowerCase() || ''}`;
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return null;
}

async function main() {
  console.log('🚀 Starting place updater script...');
  if (CITY_TO_UPDATE) {
    console.log(`🎯 Targeting city: ${CITY_TO_UPDATE}`);
  } else {
    console.log('🎯 Targeting all cities.');
  }

  // Build the query to find places that need updating
  let query = supabase
    .from('places')
    .select('id, name, description, main_image_url, category, city, state')
    .or('main_image_url.is.null,category.is.null');

  // Add city filter if specified
  if (CITY_TO_UPDATE) {
    query = query.eq('city', CITY_TO_UPDATE);
  }

  const { data: places, error } = await query;

  if (error) {
    console.error('❌ Error fetching places:', error.message);
    return;
  }

  if (!places || places.length === 0) {
    console.log('✅ All places seem to be updated. Nothing to do!');
    return;
  }

  console.log(`ℹ️ Found ${places.length} places to update.\n`);

  for (const [index, place] of places.entries()) {
    const locationName = place.city;
    if (!locationName) {
      console.log(`⏩ Skipping "${place.name}" because it has no associated city, which is needed for image search.`);
      continue;
    }

    console.log(`\n--- [${index + 1}/${places.length}] Processing: ${place.name}, ${locationName} ---`);

    // --- Image Handling ---
    let imageUrl = place.main_image_url;
    if (!imageUrl) {
      const searchQuery = `${place.name} ${locationName} India`;
      const suggestedImageUrl = await searchUnsplashImage(searchQuery);
      
      const response = await prompts({
        type: 'text',
        name: 'url',
        message: 'Enter image URL',
        initial: suggestedImageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        hint: suggestedImageUrl ? `Suggested based on search for "${searchQuery}"` : 'No suggestion found. Please provide a URL.'
      });
      imageUrl = response.url;
    }

    // --- Category Handling ---
    let category = place.category;
    if (!category) {
      const guessedCategory = guessCategory(place);
      const initialCategoryIndex = guessedCategory ? PLACE_CATEGORIES.indexOf(guessedCategory) : 0;

      const response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Select a category',
        choices: PLACE_CATEGORIES.map(c => ({ title: c, value: c })),
        initial: initialCategoryIndex,
        hint: guessedCategory ? `Suggested: ${guessedCategory}` : 'No suggestion. Please select one.'
      });
      category = response.value;
    }

    if (!imageUrl || !category) {
        console.log('⏩ Skipping update due to missing information.');
        continue;
    }

    // --- Database Update ---
    const { error: updateError } = await supabase
      .from('places')
      .update({ main_image_url: imageUrl, category: category })
      .eq('id', place.id);

    if (updateError) {
      console.error(`❌ Failed to update "${place.name}":`, updateError.message);
    } else {
      console.log(`✅ Successfully updated "${place.name}"!`);
    }
  }

  console.log('\n🎉 Script finished!');
}

main().catch(console.error);