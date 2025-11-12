import Stripe from 'stripe';
import Unit from '@unit-finance/unit-node-sdk';
import { env, assertEnv } from '@/lib/env';

let stripe: Stripe | null = null;
let unitClient: InstanceType<typeof Unit> | null = null;

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

export function getUnitClient() {
  if (!unitClient) {
    assertEnv(['UNIT_API_KEY']);
    unitClient = new Unit({ apiKey: env.UNIT_API_KEY!, env: 'sandbox' });
  }
  return unitClient;
}
