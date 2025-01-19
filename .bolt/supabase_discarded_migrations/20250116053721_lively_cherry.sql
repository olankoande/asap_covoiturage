-- Create test rides for the test user
DO $$
DECLARE
  test_user_id uuid;
  test_vehicle_id uuid;
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  -- Get test vehicle ID
  SELECT id INTO test_vehicle_id
  FROM vehicles
  WHERE user_id = test_user_id;

  -- Create test rides
  IF test_user_id IS NOT NULL AND test_vehicle_id IS NOT NULL THEN
    INSERT INTO rides (
      driver_id,
      vehicle_id,
      departure,
      destination,
      date,
      time,
      price,
      seats,
      description
    ) VALUES
      (
        test_user_id,
        test_vehicle_id,
        'Montreal, QC',
        'Toronto, ON',
        CURRENT_DATE + interval '1 day',
        '08:00',
        45.00,
        3,
        'Trajet direct avec pause café à Kingston. Départ du centre-ville de Montréal.'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Toronto, ON',
        'Montreal, QC',
        CURRENT_DATE + interval '2 days',
        '14:00',
        45.00,
        3,
        'Retour à Montréal. Possibilité de petits bagages uniquement.'
      );
  END IF;
END $$;