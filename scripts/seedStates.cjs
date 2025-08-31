require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const indianStates = [
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    capital: 'Amaravati',
    region: 'South',
    population: 49577103,
    area_km2: 160205,
    languages: ['Telugu', 'Urdu'],
    best_time_to_visit: 'November to March',
    image_url: 'https://example.com/images/andhra-pradesh.jpg',
    description: 'Known as the Rice Bowl of India, famous for its spicy cuisine and rich cultural heritage.'
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    capital: 'Bhopal',
    region: 'Central',
    population: 85358965,
    area_km2: 308245,
    languages: ['Hindi'],
    best_time_to_visit: 'October to March',
    image_url: 'https://example.com/images/madhya-pradesh.jpg',
    description: 'The Heart of India, known for its ancient temples, wildlife sanctuaries, and rich history.'
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    capital: 'Jaipur',
    region: 'North',
    population: 81032689,
    area_km2: 342239,
    languages: ['Hindi', 'Rajasthani'],
    best_time_to_visit: 'October to March',
    image_url: 'https://example.com/images/rajasthan.jpg',
    description: 'The Land of Kings, famous for its royal palaces, forts, and the Thar Desert.'
  },
  {
    name: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    region: 'South',
    population: 35699443,
    area_km2: 38863,
    languages: ['Malayalam'],
    best_time_to_visit: 'September to March',
    image_url: 'https://example.com/images/kerala.jpg',
    description: 'God\'s Own Country, known for its backwaters, beaches, and Ayurvedic treatments.'
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    capital: 'Lucknow',
    region: 'North',
    population: 237882725,
    area_km2: 243286,
    languages: ['Hindi', 'Urdu'],
    best_time_to_visit: 'October to March',
    image_url: 'https://example.com/images/uttar-pradesh.jpg',
    description: 'Home to the Taj Mahal and Varanasi, rich in cultural and historical significance.'
  }
];

async function seedStates() {
  try {
    console.log('Starting to seed states...');
    
    // Clear existing states
    const { error: deleteError } = await supabase
      .from('states')
      .delete()
      .neq('id', 0); // Delete all states (non-zero ID)

    if (deleteError) {
      console.error('Error clearing states:', deleteError);
      return;
    }

    // Insert new states
    const { data, error } = await supabase
      .from('states')
      .insert(indianStates)
      .select();

    if (error) {
      console.error('Error seeding states:', error);
      return;
    }

    console.log('Successfully seeded states:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seed function
seedStates().then(() => {
  console.log('Seeding completed');
  process.exit(0);
}).catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
