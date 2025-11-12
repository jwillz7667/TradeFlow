import { auth } from '@clerk/nextjs/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function requireUser() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function getUserCompanyId(userId: string) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('User not onboarded');
  }

  return data.company_id as string;
}
