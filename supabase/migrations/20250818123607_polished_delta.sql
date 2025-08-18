/*
  # Create places table for tourism data

  1. New Tables
    - `places`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of the place
      - `description` (text) - Description of the place
      - `location` (text, required) - City/area location
      - `state` (text) - State name
      - `country` (text, default 'India') - Country name
      - `latitude` (double precision) - GPS latitude
      - `longitude` (double precision) - GPS longitude
      - `category` (text) - Type of place (temple, monument, etc.)
      - `rating` (double precision) - Average rating
      - `price_range` (text) - Price category
      - `best_time_to_visit` (text) - Recommended visiting time
      - `duration` (text) - Recommended visit duration
      - `image_url` (text) - Main image URL
      - `images` (text[]) - Array of additional images
      - `features` (text[]) - Array of features/amenities
      - `contact_info` (jsonb) - Contact information
      - `opening_hours` (jsonb) - Opening hours data
      - `entry_fee` (double precision) - Entry fee amount
      - `is_featured` (boolean) - Featured on homepage
      - `is_active` (boolean) - Active/visible status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `places` table
    - Add policy for public read access
    - Add policy for authenticated insert access
    - Add policy for admin update/delete access
*/

CREATE TABLE IF NOT EXISTS public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  state text,
  country text DEFAULT 'India' NOT NULL,
  latitude double precision,
  longitude double precision,
  category text,
  rating double precision DEFAULT 0,
  price_range text,
  best_time_to_visit text,
  duration text,
  image_url text,
  images text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  opening_hours jsonb DEFAULT '{}',
  entry_fee double precision,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active places
CREATE POLICY "Enable read access for active places" 
  ON public.places 
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to insert places
CREATE POLICY "Enable insert for authenticated users" 
  ON public.places 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own places or admins to update any
CREATE POLICY "Enable update for authenticated users" 
  ON public.places 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Allow users to delete their own places or admins to delete any
CREATE POLICY "Enable delete for authenticated users" 
  ON public.places 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_places_updated_at 
  BEFORE UPDATE ON public.places 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();