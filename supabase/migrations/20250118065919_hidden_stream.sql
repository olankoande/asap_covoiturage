-- Update test user credentials
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  -- If test user exists, update password
  IF test_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf'))
    WHERE id = test_user_id;
  ELSE
    -- Create new test user if it doesn't exist
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
  END IF;
END $$;