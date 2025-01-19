/*
  # Add location columns to rides table

  1. Changes
    - Add departure_location and destination_location columns to rides table
    - These columns will store the latitude/longitude coordinates as text
*/

-- Add location columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'departure_location'
  ) THEN
    ALTER TABLE rides ADD COLUMN departure_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'destination_location'
  ) THEN
    ALTER TABLE rides ADD COLUMN destination_location text;
  END IF;
END $$;