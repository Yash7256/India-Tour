import { promises as fs } from 'fs';
import path from 'path';
import prompts from 'prompts';
import 'dotenv/config';

// --- Configuration ---
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

const SOURCE_FILE = 'places-to-update.json';
const OUTPUT_FILE = 'places-updated.json';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center';

if (!unsplashAccessKey) {
  console.warn(
    '⚠️ Warning: Missing UNSPLASH_ACCESS_KEY in your .env file. The script will run without automatic image suggestions.'
  );
}

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
      const errorBody = await response.text();
      console.error('Error details:', errorBody);
      return null;
    }
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (e) {
    console.error('Error searching Unsplash:', e);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting JSON image updater script...');

  const sourceFilePath = path.join(process.cwd(), SOURCE_FILE);
  let placesData;

  try {
    const fileContent = await fs.readFile(sourceFilePath, 'utf-8');
    placesData = JSON.parse(fileContent);
    console.log(`✅ Successfully loaded ${placesData.length} places from ${SOURCE_FILE}.`);
  } catch (error) {
    console.error(`❌ Error: Could not read or parse the source file: ${sourceFilePath}`);
    console.error('Please make sure you have saved your JSON data into a file named "places-to-update.json" in the root of your project.');
    return;
  }

  for (const [index, place] of placesData.entries()) {
    console.log(`\n--- [${index + 1}/${placesData.length}] Processing: ${place.name}, ${place.city} ---`);
    console.log(`Current URL: ${place.main_image_url || 'Not set'}`);

    const searchQuery = `${place.name} ${place.city} India`;
    const suggestedImageUrl = await searchUnsplashImage(searchQuery);

    const response = await prompts({
      type: 'text',
      name: 'url',
      message: `Enter new image URL for "${place.name}"`,
      initial: suggestedImageUrl || place.main_image_url || DEFAULT_IMAGE,
      hint: suggestedImageUrl ? `Suggested for "${searchQuery}"` : 'No suggestion found. Please provide a URL.'
    });

    if (response.url) {
      place.main_image_url = response.url;
      console.log(`✔️  Updated URL for "${place.name}"`);
    } else {
      console.log(`⏩ Skipped "${place.name}" (no URL provided).`);
    }
  }

  const outputFilePath = path.join(process.cwd(), OUTPUT_FILE);
  try {
    await fs.writeFile(outputFilePath, JSON.stringify(placesData, null, 2));
    console.log(`\n🎉 Script finished!`);
    console.log(`✅ Updated data saved to: ${outputFilePath}`);
  } catch (error) {
    console.error(`❌ Error writing to output file: ${outputFilePath}`, error);
  }
}

main().catch(console.error);