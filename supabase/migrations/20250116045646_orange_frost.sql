/*
  # Add bookings table and fix relationships

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `ride_id` (uuid, references rides)
      - `passenger_id` (uuid, references profiles)
      - `seats` (integer)
      - `status` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add foreign key relationships between tables
    - Add RLS policies for bookings table

  3. Security
    - Enable RLS on bookings table
    - Add policies for authenticated users
*/

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides NOT NULL,
  passenger_id uuid REFERENCES profiles NOT NULL,
  seats integer NOT NULL CHECK (seats > 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = passenger_id OR 
    auth.uid() IN (
      SELECT driver_id FROM rides WHERE id = ride_id
    )
  );

CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = passenger_id OR 
    auth.uid() IN (
      SELECT driver_id FROM rides WHERE id = ride_id
    )
  )
  WITH CHECK (
    auth.uid() = passenger_id OR 
    auth.uid() IN (
      SELECT driver_id FROM rides WHERE id = ride_id
    )
  );

-- Add comment for PostgREST foreign key relationships
COMMENT ON CONSTRAINT bookings_ride_id_fkey ON bookings IS 
  E'@foreignKey (ride_id) references rides(id)';

COMMENT ON CONSTRAINT bookings_passenger_id_fkey ON bookings IS 
  E'@foreignKey (passenger_id) references profiles(id)';

COMMENT ON CONSTRAINT rides_driver_id_fkey ON rides IS 
  E'@foreignKey (driver_id) references profiles(id)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bookings_ride_id_idx ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS bookings_passenger_id_idx ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS rides_driver_id_idx ON rides(driver_id);