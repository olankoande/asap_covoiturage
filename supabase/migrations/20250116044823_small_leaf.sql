/*
  # Fix rides-profiles relationship

  1. Changes
    - Create missing profiles for existing rides
    - Add foreign key constraint between rides.driver_id and profiles.id
*/

-- Create missing profiles for existing drivers
INSERT INTO profiles (id)
SELECT DISTINCT driver_id
FROM rides
WHERE driver_id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Drop existing constraint if it exists
ALTER TABLE rides
DROP CONSTRAINT IF EXISTS rides_driver_id_fkey;

-- Add new constraint referencing profiles
ALTER TABLE rides
ADD CONSTRAINT rides_driver_id_fkey
FOREIGN KEY (driver_id)
REFERENCES profiles(id);

-- Update the rides query helper
COMMENT ON CONSTRAINT rides_driver_id_fkey ON rides IS 
  E'@foreignKey (driver_id) references profiles(id)';