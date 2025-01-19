/*
  # Add payments system

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `amount` (numeric)
      - `status` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE passenger_id = auth.uid() 
      OR ride_id IN (
        SELECT id FROM rides WHERE driver_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE passenger_id = auth.uid()
    )
  );

-- Add comment for PostgREST foreign key relationships
COMMENT ON CONSTRAINT payments_booking_id_fkey ON payments IS 
  E'@foreignKey (booking_id) references bookings(id)';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS payments_booking_id_idx ON payments(booking_id);