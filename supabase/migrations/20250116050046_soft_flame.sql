/*
  # Create test users with proper error handling

  1. Changes
    - Add proper existence checks before creating users
    - Handle profile creation safely
    - Set up proper password hashing
*/

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to create a test user
CREATE OR REPLACE FUNCTION create_test_user(
  email text,
  password text,
  first_name text,
  last_name text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id
  FROM auth.users
  WHERE auth.users.email = create_test_user.email;

  -- If user doesn't exist, create new user
  IF user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      email,
      crypt(password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'first_name', first_name,
        'last_name', last_name
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;

    -- Insert into profiles only if user was created
    INSERT INTO profiles (id, first_name, last_name)
    VALUES (user_id, first_name, last_name)
    ON CONFLICT (id) DO UPDATE
    SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
DO $$
BEGIN
  -- Create test user
  PERFORM create_test_user(
    'test@example.com',
    'password123',
    'Test',
    'User'
  );
END $$;