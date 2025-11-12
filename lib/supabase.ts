import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, assertEnv } from '@/lib/env';
import type { Database } from '@/types/database';

let anonClient: SupabaseClient<Database> | null = null;
let serviceClient: SupabaseClient<Database> | null = null;

export function getAnonClient() {
  if (!anonClient) {
    assertEnv(['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']);
    anonClient = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
      global: { headers: { 'x-application-name': 'tradeflow-os' } }
    });
  }
  return anonClient;
}

export function getServiceRoleClient() {
  if (!serviceClient) {
    assertEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
    serviceClient = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
      global: { headers: { 'x-application-name': 'tradeflow-os' } }
    });
  }
  return serviceClient;
}
