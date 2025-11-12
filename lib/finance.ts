import Stripe from 'stripe';
import { env, assertEnv } from '@/lib/env';

let stripe: Stripe | null = null;

export function getStripeClient() {
  if (!stripe) {
    assertEnv(['STRIPE_SECRET_KEY']);
    stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
      typescript: true
    });
  }
  return stripe;
}

// Unit Finance SDK has TypeScript issues - leaving as placeholder for now
export function getUnitClient() {
  assertEnv(['UNIT_API_KEY']);
  // TODO: Fix Unit SDK TypeScript integration
  throw new Error('Unit client not implemented');
}
