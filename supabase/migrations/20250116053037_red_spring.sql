-- Create test user safely
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- First check if test user exists
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  -- If test user exists, first delete all related records
  IF test_user_id IS NOT NULL THEN
    -- Delete related records in the correct order to respect foreign key constraints
    DELETE FROM transactions WHERE booking_id IN (SELECT id FROM bookings WHERE passenger_id = test_user_id);
    DELETE FROM payment_methods WHERE user_id = test_user_id;
    DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE passenger_id = test_user_id);
    DELETE FROM bookings WHERE passenger_id = test_user_id OR ride_id IN (SELECT id FROM rides WHERE driver_id = test_user_id);
    DELETE FROM rides WHERE driver_id = test_user_id;
    DELETE FROM vehicles WHERE user_id = test_user_id;
    DELETE FROM profiles WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
  END IF;

  -- Now create the new test user
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
    recovery_token,
    aud,
    role
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Test","last_name":"User"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  ) RETURNING id INTO test_user_id;

  -- Create profile for test user
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (test_user_id, 'Test', 'User')
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  -- Create a test vehicle for the user
  INSERT INTO vehicles (user_id, brand, model, color, plate_number)
  VALUES (test_user_id, 'Toyota', 'Camry', 'Silver', 'TEST123');
END $$;