-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create objects table for storing file metadata
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  path text GENERATED ALWAYS AS (bucket_id || '/' || name) STORED
);

-- Create buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

-- Add bucket_id foreign key to objects
ALTER TABLE storage.objects
  ADD CONSTRAINT objects_buckets_fkey
  FOREIGN KEY (bucket_id)
  REFERENCES storage.buckets(id);

-- Create indexes
CREATE INDEX objects_bucket_id_name_idx ON storage.objects (bucket_id, name);
CREATE INDEX objects_created_at_idx ON storage.objects (created_at);
CREATE INDEX buckets_created_at_idx ON storage.buckets (created_at);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Insert buckets
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES 
  ('profile-images', 'Profile Images', true, ARRAY['image/jpeg', 'image/png', 'image/gif']),
  ('vehicle-images', 'Vehicle Images', true, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for objects
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('profile-images', 'vehicle-images'));

CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images', 'vehicle-images') AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Create policies for buckets
CREATE POLICY "Public buckets are viewable"
  ON storage.buckets FOR SELECT
  USING (public = true);

CREATE POLICY "Users can create objects in public buckets"
  ON storage.buckets FOR INSERT
  TO authenticated
  WITH CHECK (public = true);