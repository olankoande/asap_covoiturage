/*
  # Fix Profile Creation and RLS Policies

  1. Changes
    - Drop and recreate all profile-related policies
    - Add SECURITY DEFINER to handle_new_user function
    - Add proper error handling for profile creation
    - Ensure proper cleanup of existing policies
    - Add missing indexes for performance

  2. Security
    - Enable RLS on profiles table
    - Allow public viewing of profiles
    - Restrict profile creation/updates to authenticated users
    - Ensure users can only modify their own profiles
*/

-- Drop existing policies and triggers
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with better names and permissions
CREATE POLICY "Allow public profile viewing"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or replace the function to handle new user creation with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at)
  VALUES (new.id, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- Ensure all existing users have profiles
INSERT INTO profiles (id, created_at)
SELECT id, COALESCE(created_at, now()) 
FROM auth.users
ON CONFLICT (id) DO NOTHING;