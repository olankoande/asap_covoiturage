import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key');

export { stripePromise };