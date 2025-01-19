-- Add PayPal fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paypal_email text,
ADD COLUMN IF NOT EXISTS paypal_business_name text,
ADD COLUMN IF NOT EXISTS paypal_is_business boolean DEFAULT false;

-- Add validation for PayPal email format
ALTER TABLE profiles
ADD CONSTRAINT valid_paypal_email
CHECK (
  paypal_email IS NULL OR 
  paypal_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add business name requirement when is_business is true
ALTER TABLE profiles
ADD CONSTRAINT business_name_required
CHECK (
  (NOT paypal_is_business) OR 
  (paypal_is_business AND paypal_business_name IS NOT NULL)
);

-- Add comments for documentation
COMMENT ON COLUMN profiles.paypal_email IS 'Email PayPal pour recevoir les paiements';
COMMENT ON COLUMN profiles.paypal_business_name IS 'Nom de l''entreprise pour les comptes PayPal Business';
COMMENT ON COLUMN profiles.paypal_is_business IS 'Indique si le compte PayPal est un compte Business';