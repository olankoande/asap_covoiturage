/*
  # Système de paiement

  1. Nouvelles Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `last_digits` (text)
      - `expiry_date` (text)
      - `created_at` (timestamp)

    - `transactions`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `amount` (numeric)
      - `status` (text)
      - `payment_method_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles NOT NULL,
  type text NOT NULL CHECK (type IN ('credit_card', 'debit_card')),
  last_digits text NOT NULL,
  expiry_date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method_id uuid REFERENCES payment_methods,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
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

CREATE POLICY "Users can create transactions for their bookings"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE passenger_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS transactions_booking_id_idx ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS transactions_payment_method_id_idx ON transactions(payment_method_id);