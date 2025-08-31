-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create states table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  description TEXT,
  capital TEXT,
  region TEXT,
  population BIGINT,
  area_km2 NUMERIC(10, 2),
  languages TEXT[],
  best_time_to_visit TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add state_id column to cities table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'cities' 
                AND column_name = 'state_id') THEN
    -- Add state_id column
    ALTER TABLE public.cities ADD COLUMN state_id UUID;
    
    -- Create index on state_id
    CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities(state_id);
    
    -- Add foreign key constraint
    ALTER TABLE public.cities 
      ADD CONSTRAINT fk_cities_state 
      FOREIGN KEY (state_id) REFERENCES public.states(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Create or replace the update_modified_column function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for states table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_states_modtime'
  ) THEN
    CREATE TRIGGER update_states_modtime
    BEFORE UPDATE ON public.states
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();
  END IF;
END $$;

-- Create or replace the search_states function
CREATE OR REPLACE FUNCTION public.search_states(query TEXT)
RETURNS SETOF public.states AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.states
  WHERE 
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(capital, '')) 
    @@ plainto_tsquery('english', query);
END;
$$ LANGUAGE plpgsql;

-- Create or replace the state_statistics view
CREATE OR REPLACE VIEW public.state_statistics AS
SELECT 
  s.id,
  s.name,
  s.code,
  s.capital,
  s.region,
  COUNT(DISTINCT c.id) AS city_count,
  COUNT(DISTINCT p.id) AS place_count,
  AVG(p.rating) AS avg_rating
FROM public.states s
LEFT JOIN public.cities c ON c.state_id = s.id
LEFT JOIN public.places p ON p.city_id = c.id
GROUP BY s.id, s.name, s.code, s.capital, s.region;

-- Insert some sample states if they don't exist
INSERT INTO public.states (name, code, capital, region, population, area_km2, languages, best_time_to_visit, description, image_url)
VALUES 
  ('Andhra Pradesh', 'AP', 'Amaravati', 'South', 49577103, 160205, '{"Telugu", "Urdu"}', 'November to March', 'Known as the Rice Bowl of India, famous for its spicy cuisine and rich cultural heritage.', 'https://example.com/images/andhra-pradesh.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.states (name, code, capital, region, population, area_km2, languages, best_time_to_visit, description, image_url)
VALUES 
  ('Madhya Pradesh', 'MP', 'Bhopal', 'Central', 85358965, 308245, '{"Hindi"}', 'October to March', 'The Heart of India, known for its ancient temples, wildlife sanctuaries, and rich history.', 'https://example.com/images/madhya-pradesh.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.states (name, code, capital, region, population, area_km2, languages, best_time_to_visit, description, image_url)
VALUES 
  ('Rajasthan', 'RJ', 'Jaipur', 'North', 81032689, 342239, '{"Hindi", "Rajasthani"}', 'October to March', 'The Land of Kings, famous for its royal palaces, forts, and the Thar Desert.', 'https://example.com/images/rajasthan.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.states (name, code, capital, region, population, area_km2, languages, best_time_to_visit, description, image_url)
VALUES 
  ('Kerala', 'KL', 'Thiruvananthapuram', 'South', 35699443, 38863, '{"Malayalam"}', 'September to March', 'God''s Own Country, known for its backwaters, beaches, and Ayurvedic treatments.', 'https://example.com/images/kerala.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.states (name, code, capital, region, population, area_km2, languages, best_time_to_visit, description, image_url)
VALUES 
  ('Uttar Pradesh', 'UP', 'Lucknow', 'North', 237882725, 243286, '{"Hindi", "Urdu"}', 'October to March', 'Home to the Taj Mahal and Varanasi, rich in cultural and historical significance.', 'https://example.com/images/uttar-pradesh.jpg')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing state names to the new states table
-- This will only add states that don't already exist
INSERT INTO public.states (name, code, created_at, updated_at)
SELECT DISTINCT state, UPPER(LEFT(state, 2)), NOW(), NOW()
FROM public.cities
WHERE state IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.states s WHERE s.name = public.cities.state
);

-- Update the state_id in cities table
UPDATE public.cities c
SET state_id = s.id
FROM public.states s
WHERE c.state = s.name;
