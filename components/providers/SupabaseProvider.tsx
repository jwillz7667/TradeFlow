'use client';

import { createContext, useContext, useMemo } from 'react';
import { createClientComponentClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
}
