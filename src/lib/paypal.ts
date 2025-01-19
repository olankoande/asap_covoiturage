import { PayPalScriptOptions } from '@paypal/paypal-js';

// Load PayPal credentials from environment variables
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export const paypalConfig: PayPalScriptOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'CAD',
  intent: 'capture'
};