-- Add image_url column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Add image_url column to vehicles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN image_url text;
  END IF;
END $$;

-- Create function to update profile image
CREATE OR REPLACE FUNCTION update_profile_image(
  user_id uuid,
  new_image_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET avatar_url = new_image_url,
      updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Create function to update vehicle image
CREATE OR REPLACE FUNCTION update_vehicle_image(
  vehicle_id uuid,
  new_image_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vehicles
  SET image_url = new_image_url,
      updated_at = now()
  WHERE id = vehicle_id;
END;
$$;

-- Add updated_at column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add updated_at column to vehicles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS vehicles_updated_at_idx ON vehicles(updated_at);