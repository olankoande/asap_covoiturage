/*
  # Fix profiles RLS policies

  1. Changes
    - Drop existing RLS policies
    - Add new policies for:
      - Profile creation (for authenticated users)
      - Profile viewing (public profiles)
      - Profile updates (own profile only)
    - Add trigger for automatic profile creation

  2. Security
    - Enable RLS on profiles table
    - Ensure users can only modify their own profiles
    - Allow public viewing of profiles
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and create it again
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();