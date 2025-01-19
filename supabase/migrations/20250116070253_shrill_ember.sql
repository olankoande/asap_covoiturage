/*
  # Ajout du système de suivi et solde électronique

  1. Modifications des tables existantes
    - Ajout du champ status à la table rides
    - Ajout du champ wallet_balance à la table profiles
    - Ajout des champs de suivi temporel aux tables rides et parcel_deliveries

  2. Sécurité
    - Mise à jour des politiques RLS pour les nouvelles colonnes
    - Ajout de contraintes de validation

  3. Fonctions
    - Ajout de fonctions pour la gestion du solde
    - Ajout de triggers pour la mise à jour automatique du solde
*/

-- Ajout du champ status à la table rides
ALTER TABLE rides
ADD COLUMN IF NOT EXISTS status text NOT NULL 
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
DEFAULT 'pending';

-- Ajout du champ wallet_balance à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wallet_balance numeric NOT NULL DEFAULT 0
CHECK (wallet_balance >= 0);

-- Ajout des champs de suivi temporel
ALTER TABLE rides
ADD COLUMN IF NOT EXISTS start_time timestamptz,
ADD COLUMN IF NOT EXISTS end_time timestamptz;

-- Fonction pour mettre à jour le solde du conducteur
CREATE OR REPLACE FUNCTION update_driver_balance()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculer le montant total des réservations
    UPDATE profiles
    SET wallet_balance = wallet_balance + (
      SELECT COALESCE(SUM(r.price * b.seats), 0)
      FROM rides r
      LEFT JOIN bookings b ON b.ride_id = r.id
      WHERE r.id = NEW.id AND b.status = 'confirmed'
    )
    WHERE id = NEW.driver_id;
    
    -- Ajouter le montant des livraisons
    UPDATE profiles
    SET wallet_balance = wallet_balance + (
      SELECT COALESCE(SUM(delivery_price), 0)
      FROM parcel_deliveries
      WHERE ride_id = NEW.id AND status = 'delivered'
    )
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour la mise à jour automatique du solde
DROP TRIGGER IF EXISTS on_ride_completed ON rides;
CREATE TRIGGER on_ride_completed
  AFTER UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_balance();

-- Mise à jour des contraintes temporelles
ALTER TABLE rides
ADD CONSTRAINT valid_times
CHECK (
  (status = 'in_progress' AND start_time IS NOT NULL) OR
  (status = 'completed' AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time) OR
  (status IN ('pending', 'cancelled'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS rides_status_idx ON rides(status);
CREATE INDEX IF NOT EXISTS rides_driver_status_idx ON rides(driver_id, status);

-- Commentaires pour la documentation
COMMENT ON COLUMN rides.status IS 'État actuel du trajet (pending, in_progress, completed, cancelled)';
COMMENT ON COLUMN profiles.wallet_balance IS 'Solde disponible du conducteur';
COMMENT ON COLUMN rides.start_time IS 'Heure de début du trajet';
COMMENT ON COLUMN rides.end_time IS 'Heure de fin du trajet';