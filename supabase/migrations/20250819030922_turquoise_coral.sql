/*
  # Add role column to profiles table

  1. Changes
    - Add `role` column to `profiles` table with default value 'user'
    - Add check constraint to ensure role is either 'user' or 'admin'
    - Update existing users to have 'user' role by default

  2. Security
    - Maintains existing RLS policies
    - Only authenticated users can update their own profiles (but role should be managed by admins)
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' NOT NULL;
  END IF;
END $$;

-- Add check constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Update existing users to have 'user' role (if any exist without role)
UPDATE profiles SET role = 'user' WHERE role IS NULL;