/*
  # Payment Methods and Vehicle Images

  1. Changes
    - Add payment_methods array to rides table
    - Add image_url to vehicles table with default image
    - Add constraints and indexes for better data integrity

  2. Security
    - Add check constraint for payment methods
    - Ensure proper data types and defaults
*/

-- Add payment_methods to rides if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'payment_methods'
  ) THEN
    ALTER TABLE rides ADD COLUMN payment_methods text[] DEFAULT ARRAY['cash'];
  END IF;
END $$;

-- Add check constraint for payment methods if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rides_payment_methods_check'
  ) THEN
    ALTER TABLE rides ADD CONSTRAINT rides_payment_methods_check 
      CHECK (payment_methods <@ ARRAY['cash', 'credit_card']::text[]);
  END IF;
END $$;

-- Create or replace function to get default vehicle image
CREATE OR REPLACE FUNCTION get_default_vehicle_image()
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'https://res.cloudinary.com/ddyrp671i/image/upload/v1737008202/ASAP/default-vehicle.jpg';
$$;

-- Add image_url column to vehicles if it doesn't exist and set default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN image_url text DEFAULT get_default_vehicle_image();
  END IF;
END $$;

-- Update existing vehicles to use default image where none exists
UPDATE vehicles 
SET image_url = get_default_vehicle_image()
WHERE image_url IS NULL;

-- Create index for payment_methods for better query performance
CREATE INDEX IF NOT EXISTS rides_payment_methods_idx ON rides USING gin(payment_methods);

-- Add comments for documentation
COMMENT ON COLUMN rides.payment_methods IS 'Array of accepted payment methods (cash, credit_card)';
COMMENT ON COLUMN vehicles.image_url IS 'URL of the vehicle image, defaults to a standard image';
COMMENT ON FUNCTION get_default_vehicle_image() IS 'Returns the default vehicle image URL';