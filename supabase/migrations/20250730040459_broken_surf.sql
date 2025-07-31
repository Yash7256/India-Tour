/*
  # Create itineraries table

  1. New Tables
    - `itineraries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text, nullable)
      - `cities` (text array)
      - `start_date` (date)
      - `end_date` (date)
      - `is_public` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `itineraries` table
    - Add policies for users to manage their own itineraries
    - Add policy for public read access to public itineraries
*/

CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  cities text[] DEFAULT '{}',
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own itineraries"
  ON itineraries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public itineraries"
  ON itineraries
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create their own itineraries"
  ON itineraries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON itineraries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON itineraries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON itineraries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();