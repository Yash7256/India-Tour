-- Create digital_ids table
CREATE TABLE IF NOT EXISTS public.digital_ids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gov_id_type TEXT NOT NULL,
  gov_id_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  blood_group TEXT,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_relation TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  digital_id_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_digital_id UNIQUE (user_id, digital_id_number)
);

-- Add RLS policies
ALTER TABLE public.digital_ids ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own digital IDs
CREATE POLICY "Users can view their own digital IDs"
  ON public.digital_ids
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own digital IDs
CREATE POLICY "Users can create their own digital IDs"
  ON public.digital_ids
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own digital IDs
CREATE POLICY "Users can update their own digital IDs"
  ON public.digital_ids
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own digital IDs
CREATE POLICY "Users can delete their own digital IDs"
  ON public.digital_ids
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on each update
CREATE TRIGGER update_digital_ids_updated_at
BEFORE UPDATE ON public.digital_ids
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
