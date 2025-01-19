/*
  # Create rides and messages tables with policy checks

  1. New Tables
    - `rides`
      - `id` (uuid, primary key)
      - `driver_id` (uuid, references auth.users)
      - `vehicle_id` (uuid, references vehicles)
      - `departure` (text)
      - `destination` (text)
      - `date` (date)
      - `time` (time)
      - `price` (numeric)
      - `seats` (integer)
      - `description` (text, optional)
      - `created_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references auth.users)
      - `receiver_id` (uuid, references auth.users)
      - `ride_id` (uuid, references rides)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations with existence checks
*/

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES vehicles NOT NULL,
  departure text NOT NULL,
  destination text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  seats integer NOT NULL CHECK (seats > 0),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  ride_id uuid REFERENCES rides NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Rides policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rides' AND policyname = 'Anyone can view rides'
  ) THEN
    CREATE POLICY "Anyone can view rides"
      ON rides
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rides' AND policyname = 'Users can create their own rides'
  ) THEN
    CREATE POLICY "Users can create their own rides"
      ON rides
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = driver_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rides' AND policyname = 'Drivers can update their own rides'
  ) THEN
    CREATE POLICY "Drivers can update their own rides"
      ON rides
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = driver_id)
      WITH CHECK (auth.uid() = driver_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rides' AND policyname = 'Drivers can delete their own rides'
  ) THEN
    CREATE POLICY "Drivers can delete their own rides"
      ON rides
      FOR DELETE
      TO authenticated
      USING (auth.uid() = driver_id);
  END IF;
END $$;

-- Messages policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view their own messages'
  ) THEN
    CREATE POLICY "Users can view their own messages"
      ON messages
      FOR SELECT
      TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON messages
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = sender_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update their own sent messages'
  ) THEN
    CREATE POLICY "Users can update their own sent messages"
      ON messages
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = sender_id)
      WITH CHECK (auth.uid() = sender_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can delete their own sent messages'
  ) THEN
    CREATE POLICY "Users can delete their own sent messages"
      ON messages
      FOR DELETE
      TO authenticated
      USING (auth.uid() = sender_id);
  END IF;
END $$;