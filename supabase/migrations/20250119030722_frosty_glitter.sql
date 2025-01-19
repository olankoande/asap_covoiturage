/*
  # Add test rides

  1. Changes
    - Add 20 test rides between major Canadian cities
    - Each ride has realistic pricing and timing
    - Rides are spread across different dates
    - Includes both one-way and return trips

  2. Test Data
    - Uses existing test user as driver
    - Uses realistic routes between major cities
    - Includes popular routes like Montreal-Toronto, Ottawa-Montreal
*/

-- Get test user and vehicle
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
  WHERE user_id = test_user_id
  LIMIT 1;

  -- Create test rides
  IF test_user_id IS NOT NULL AND test_vehicle_id IS NOT NULL THEN
    -- Clear existing test rides
    DELETE FROM rides WHERE driver_id = test_user_id;

    -- Insert new test rides
    INSERT INTO rides (
      driver_id,
      vehicle_id,
      departure,
      destination,
      date,
      time,
      price,
      seats,
      description,
      payment_methods,
      status
    ) VALUES
      -- Montreal - Toronto Routes
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Toronto, ON, Canada',
        CURRENT_DATE + interval '1 day',
        '08:00',
        45.00,
        3,
        'Trajet direct avec pause café à Kingston. Départ du centre-ville de Montréal.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Toronto, ON, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '2 days',
        '14:00',
        45.00,
        3,
        'Retour à Montréal. Possibilité de petits bagages uniquement.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),

      -- Ottawa Routes
      (
        test_user_id,
        test_vehicle_id,
        'Ottawa, ON, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '1 day',
        '10:00',
        35.00,
        4,
        'Trajet confortable, musique au choix des passagers. Départ près du Parlement.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Ottawa, ON, Canada',
        CURRENT_DATE + interval '3 days',
        '09:00',
        35.00,
        2,
        'Trajet régulier, arrêt possible à Hawkesbury si besoin.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),

      -- Quebec City Routes
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Québec, QC, Canada',
        CURRENT_DATE + interval '2 days',
        '09:00',
        30.00,
        3,
        'Trajet direct via l''autoroute 20. Arrêt possible à Drummondville.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Québec, QC, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '3 days',
        '16:00',
        30.00,
        3,
        'Retour à Montréal en fin de journée. Départ du Vieux-Québec.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),

      -- Kingston Routes
      (
        test_user_id,
        test_vehicle_id,
        'Kingston, ON, Canada',
        'Toronto, ON, Canada',
        CURRENT_DATE + interval '4 days',
        '11:00',
        25.00,
        4,
        'Trajet court et agréable. Idéal pour les étudiants.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Toronto, ON, Canada',
        'Kingston, ON, Canada',
        CURRENT_DATE + interval '5 days',
        '15:00',
        25.00,
        4,
        'Retour vers Kingston en après-midi.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),

      -- Longer Routes
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Halifax, NS, Canada',
        CURRENT_DATE + interval '5 days',
        '06:00',
        120.00,
        2,
        'Long trajet avec pauses régulières. Parfait pour partager les frais.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Halifax, NS, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '7 days',
        '07:00',
        120.00,
        2,
        'Retour de Halifax. Départ tôt le matin.',
        ARRAY['credit_card'],
        'pending'
      ),

      -- Weekend Getaways
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Mont-Tremblant, QC, Canada',
        CURRENT_DATE + interval '6 days',
        '09:00',
        20.00,
        3,
        'Escapade ski/snowboard. Espace pour équipement.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Mont-Tremblant, QC, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '6 days',
        '16:30',
        20.00,
        3,
        'Retour après une journée de ski.',
        ARRAY['cash'],
        'pending'
      ),

      -- Business Routes
      (
        test_user_id,
        test_vehicle_id,
        'Toronto, ON, Canada',
        'Ottawa, ON, Canada',
        CURRENT_DATE + interval '8 days',
        '07:30',
        40.00,
        3,
        'Trajet matinal pour réunions d''affaires. Wifi disponible.',
        ARRAY['credit_card'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Ottawa, ON, Canada',
        'Toronto, ON, Canada',
        CURRENT_DATE + interval '8 days',
        '17:30',
        40.00,
        3,
        'Retour en fin de journée. Wifi disponible.',
        ARRAY['credit_card'],
        'pending'
      ),

      -- Student Routes
      (
        test_user_id,
        test_vehicle_id,
        'Sherbrooke, QC, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '9 days',
        '08:00',
        15.00,
        4,
        'Navette étudiante du vendredi. Ambiance décontractée.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Sherbrooke, QC, Canada',
        CURRENT_DATE + interval '11 days',
        '19:00',
        15.00,
        4,
        'Retour dimanche soir. Idéal pour les étudiants.',
        ARRAY['cash'],
        'pending'
      ),

      -- Cross-Province Routes
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Moncton, NB, Canada',
        CURRENT_DATE + interval '10 days',
        '06:00',
        90.00,
        2,
        'Traversée des provinces maritimes. Plusieurs pauses prévues.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Moncton, NB, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '12 days',
        '07:00',
        90.00,
        2,
        'Retour des maritimes. Paysages magnifiques.',
        ARRAY['cash', 'credit_card'],
        'pending'
      ),

      -- City-to-City Routes
      (
        test_user_id,
        test_vehicle_id,
        'Gatineau, QC, Canada',
        'Montréal, QC, Canada',
        CURRENT_DATE + interval '13 days',
        '10:00',
        30.00,
        3,
        'Trajet rapide et direct. Départ du centre-ville.',
        ARRAY['cash'],
        'pending'
      ),
      (
        test_user_id,
        test_vehicle_id,
        'Montréal, QC, Canada',
        'Gatineau, QC, Canada',
        CURRENT_DATE + interval '14 days',
        '14:00',
        30.00,
        3,
        'Retour vers Gatineau. Arrêt possible à mi-chemin.',
        ARRAY['cash', 'credit_card'],
        'pending'
      );
  END IF;
END $$;