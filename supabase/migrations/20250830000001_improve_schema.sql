-- Create ENUM types
CREATE TYPE place_category AS ENUM (
  'beach', 'mountain', 'heritage', 'temple', 'adventure',
  'wildlife', 'hill_station', 'pilgrimage', 'desert', 'backwaters'
);

CREATE TYPE price_range AS ENUM (
  'budget', 'moderate', 'luxury', 'premium'
);

-- Add NOT NULL constraints to places table
ALTER TABLE places 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN country SET DEFAULT 'India',
  ALTER COLUMN category TYPE place_category USING category::text::place_category,
  ALTER COLUMN price_range TYPE price_range USING price_range::text::price_range,
  ALTER COLUMN rating SET DEFAULT 0,
  ALTER COLUMN is_featured SET DEFAULT false,
  ALTER COLUMN is_active SET DEFAULT true;

-- Add indexes for performance
CREATE INDEX idx_places_location ON places(location);
CREATE INDEX idx_places_state ON places(state);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_rating ON places(rating);
CREATE INDEX idx_places_featured ON places(is_featured) WHERE is_featured = true;

-- Add geospatial index for location-based queries
CREATE INDEX idx_places_geography ON places 
  USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Add full-text search
ALTER TABLE places 
  ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(state, '')), 'C')
  ) STORED;

CREATE INDEX idx_places_search ON places USING GIN(search_vector);

-- Add foreign key constraints to reviews
ALTER TABLE reviews 
  ADD CONSTRAINT fk_reviews_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_place
  FOREIGN KEY (city_id) REFERENCES places(id)
  ON DELETE CASCADE;

-- Add created_at and updated_at timestamps if they don't exist
ALTER TABLE places 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes on reviews table
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_city_id ON reviews(city_id);
CREATE INDEX idx_reviews_attraction_id ON reviews(attraction_id) WHERE attraction_id IS NOT NULL;

-- Create function for calculating average rating
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places p
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews r
    WHERE r.city_id = NEW.city_id
  )
  WHERE p.id = NEW.city_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update place rating on review changes
CREATE TRIGGER update_place_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for places
CREATE POLICY "Enable read access for all users"
ON places FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON places FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for admins"
ON places FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM auth.users
  WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policies for reviews
CREATE POLICY "Enable read access for all users on reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for review owners"
ON reviews FOR UPDATE
USING (user_id = auth.uid());

-- Create a function to search places
CREATE OR REPLACE FUNCTION search_places(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  state TEXT,
  description TEXT,
  rating NUMERIC,
  image_url TEXT,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.location,
    p.state,
    p.description,
    p.rating,
    p.image_url,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_term)) AS similarity
  FROM places p
  WHERE p.search_vector @@ websearch_to_tsquery('english', search_term)
  ORDER BY 
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_term)) DESC,
    p.rating DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
