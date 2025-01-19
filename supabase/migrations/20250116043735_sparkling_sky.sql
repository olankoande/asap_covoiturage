/*
  # Ajout d'exemples de trajets

  1. Données d'exemple
    - Création d'utilisateurs de test
    - Création de véhicules de test
    - Création de trajets de test

  2. Sécurité
    - Utilisation des politiques existantes
*/

-- Fonction pour créer un utilisateur de test
CREATE OR REPLACE FUNCTION create_test_user(
  email text,
  first_name text,
  last_name text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insérer l'utilisateur dans auth.users
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
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    format('{"first_name":"%s","last_name":"%s"}', first_name, last_name)::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Créer des utilisateurs de test
DO $$
DECLARE
  driver1_id uuid;
  driver2_id uuid;
  vehicle1_id uuid;
  vehicle2_id uuid;
BEGIN
  -- Créer les conducteurs
  driver1_id := create_test_user('jean.dupont@example.com', 'Jean', 'Dupont');
  driver2_id := create_test_user('marie.martin@example.com', 'Marie', 'Martin');

  -- Créer les véhicules
  INSERT INTO vehicles (user_id, brand, model, color, plate_number)
  VALUES
    (driver1_id, 'Toyota', 'Camry', 'Gris', 'ABC123')
  RETURNING id INTO vehicle1_id;

  INSERT INTO vehicles (user_id, brand, model, color, plate_number)
  VALUES
    (driver2_id, 'Honda', 'Civic', 'Bleu', 'XYZ789')
  RETURNING id INTO vehicle2_id;

  -- Créer les trajets
  INSERT INTO rides (driver_id, vehicle_id, departure, destination, date, time, price, seats, description)
  VALUES
    (
      driver1_id,
      vehicle1_id,
      'Montreal, QC',
      'Toronto, ON',
      CURRENT_DATE + interval '1 day',
      '08:00',
      45.00,
      3,
      'Trajet direct avec pause café à Kingston. Départ du centre-ville de Montréal.'
    ),
    (
      driver1_id,
      vehicle1_id,
      'Toronto, ON',
      'Montreal, QC',
      CURRENT_DATE + interval '2 days',
      '14:00',
      45.00,
      3,
      'Retour à Montréal. Possibilité de petits bagages uniquement.'
    ),
    (
      driver2_id,
      vehicle2_id,
      'Ottawa, ON',
      'Montreal, QC',
      CURRENT_DATE + interval '1 day',
      '10:00',
      35.00,
      4,
      'Trajet confortable, musique au choix des passagers. Départ près du Parlement.'
    ),
    (
      driver2_id,
      vehicle2_id,
      'Montreal, QC',
      'Quebec City, QC',
      CURRENT_DATE + interval '3 days',
      '09:00',
      30.00,
      2,
      'Trajet régulier, arrêt possible à Trois-Rivières si besoin.'
    );
END $$;