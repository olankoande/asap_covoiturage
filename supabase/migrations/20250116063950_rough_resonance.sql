/*
  # Système de livraison de colis

  1. Nouvelles Tables
    - `parcel_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, référence vers profiles)
      - `pickup_location` (text)
      - `delivery_location` (text)
      - `description` (text)
      - `weight` (numeric)
      - `size` (text)
      - `requested_delivery_date` (date)
      - `price_offer` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)

    - `parcel_deliveries`
      - `id` (uuid, primary key)
      - `request_id` (uuid, référence vers parcel_requests)
      - `ride_id` (uuid, référence vers rides)
      - `driver_id` (uuid, référence vers profiles)
      - `status` (text)
      - `delivery_price` (numeric)
      - `pickup_time` (timestamptz)
      - `delivery_time` (timestamptz)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les deux tables
    - Ajout des politiques de sécurité pour contrôler l'accès
*/

-- Create parcel_requests table
CREATE TABLE IF NOT EXISTS parcel_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles NOT NULL,
  pickup_location text NOT NULL,
  delivery_location text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight > 0),
  size text NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  requested_delivery_date date NOT NULL,
  price_offer numeric NOT NULL CHECK (price_offer > 0),
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create parcel_deliveries table
CREATE TABLE IF NOT EXISTS parcel_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES parcel_requests NOT NULL,
  ride_id uuid REFERENCES rides NOT NULL,
  driver_id uuid REFERENCES profiles NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'accepted',
  delivery_price numeric NOT NULL CHECK (delivery_price > 0),
  pickup_time timestamptz,
  delivery_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE parcel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for parcel_requests
CREATE POLICY "Users can view their own parcel requests"
  ON parcel_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Drivers can view available parcel requests"
  ON parcel_requests
  FOR SELECT
  TO authenticated
  USING (status = 'pending');

CREATE POLICY "Users can create their own parcel requests"
  ON parcel_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own parcel requests"
  ON parcel_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Policies for parcel_deliveries
CREATE POLICY "Users can view their parcel deliveries"
  ON parcel_deliveries
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT sender_id FROM parcel_requests WHERE id = request_id
    ) OR
    auth.uid() = driver_id
  );

CREATE POLICY "Drivers can create parcel deliveries"
  ON parcel_deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = driver_id AND
    EXISTS (
      SELECT 1 FROM rides
      WHERE id = ride_id AND driver_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their parcel deliveries"
  ON parcel_deliveries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Create indexes for better performance
CREATE INDEX parcel_requests_sender_id_idx ON parcel_requests(sender_id);
CREATE INDEX parcel_requests_status_idx ON parcel_requests(status);
CREATE INDEX parcel_deliveries_request_id_idx ON parcel_deliveries(request_id);
CREATE INDEX parcel_deliveries_ride_id_idx ON parcel_deliveries(ride_id);
CREATE INDEX parcel_deliveries_driver_id_idx ON parcel_deliveries(driver_id);