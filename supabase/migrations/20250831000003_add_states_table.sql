-- Create states table
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

-- Add state_id foreign key to cities table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'cities' AND column_name = 'state_id') THEN
    -- Add state_id column
    ALTER TABLE cities ADD COLUMN state_id UUID;
    
    -- Create index on state_id
    CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
    
    -- Add foreign key constraint
    ALTER TABLE cities 
      ADD CONSTRAINT fk_cities_state 
      FOREIGN KEY (state_id) REFERENCES states(id)
      ON DELETE SET NULL;
      
    -- Migrate existing state names to the new states table
    INSERT INTO states (name, code, created_at, updated_at)
    SELECT DISTINCT state, UPPER(LEFT(state, 2)), NOW(), NOW()
    FROM cities
    WHERE state IS NOT NULL
    ON CONFLICT (name) DO NOTHING;
    
    -- Update the state_id in cities table
    UPDATE cities c
    SET state_id = s.id
    FROM states s
    WHERE c.state = s.name;
    
    -- Make state_id required after migration
    ALTER TABLE cities ALTER COLUMN state_id SET NOT NULL;
  END IF;
END $$;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_states_modtime
BEFORE UPDATE ON states
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create a function to search states
CREATE OR REPLACE FUNCTION search_states(query TEXT)
RETURNS SETOF states AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM states
  WHERE 
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(capital, '')) 
    @@ plainto_tsquery('english', query);
END;
$$ LANGUAGE plpgsql;

-- Create a view for state statistics
CREATE OR REPLACE VIEW state_statistics AS
SELECT 
  s.id,
  s.name,
  s.code,
  s.capital,
  s.region,
  COUNT(DISTINCT c.id) AS city_count,
  COUNT(DISTINCT p.id) AS place_count,
  AVG(p.rating) AS avg_rating
FROM states s
LEFT JOIN cities c ON c.state_id = s.id
LEFT JOIN places p ON p.city_id = c.id
GROUP BY s.id, s.name, s.code, s.capital, s.region;
