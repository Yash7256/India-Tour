/*
  # Add Admin Role and Place Management

  1. New Tables
    - Update profiles table to include admin role
    - Ensure places table exists with all required fields
  
  2. Security
    - Add RLS policies for admin access
    - Restrict admin functions to authorized users
  
  3. Admin Features
    - Role-based access control
    - Place creation and management
*/

-- Add admin role to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Create places table if it doesn't exist
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  location varchar(255) NOT NULL,
  state varchar(100),
  country varchar(100) DEFAULT 'India',
  latitude numeric(10,8),
  longitude numeric(11,8),
  category varchar(100),
  rating numeric(3,2) DEFAULT 0.0,
  price_range varchar(50),
  best_time_to_visit varchar(100),
  duration varchar(50),
  image_url text,
  images text[],
  features text[],
  contact_info jsonb,
  opening_hours jsonb,
  entry_fee numeric(10,2),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on places table
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_places_location ON places(location);
CREATE INDEX IF NOT EXISTS idx_places_state ON places(state);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating);
CREATE INDEX IF NOT EXISTS idx_places_featured ON places(is_featured);
CREATE INDEX IF NOT EXISTS idx_places_active ON places(is_active);

-- RLS Policies for places
CREATE POLICY "Anyone can view places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert places" ON places
  FOR INSERT TO public
  WITH CHECK (role() = 'authenticated');

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update trigger for places
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_places_updated_at 
  BEFORE UPDATE ON places 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create places_reviews table
CREATE TABLE IF NOT EXISTS places_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  user_id uuid,
  user_name varchar(255),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  visit_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON places_reviews(place_id);

-- Create places_amenities table
CREATE TABLE IF NOT EXISTS places_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  amenity_name varchar(100) NOT NULL,
  amenity_type varchar(50),
  is_available boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_amenities_place_id ON places_amenities(place_id);

-- Create places_nearby table
CREATE TABLE IF NOT EXISTS places_nearby (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  nearby_place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  distance_km numeric(5,2),
  travel_time varchar(50)
);