import { NextRequest, NextResponse } from 'next/server';
import { getAnonClient } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const supabase = getAnonClient();
  const search = new URL(req.url).searchParams.get('industry');

  let query = supabase.from('compliance_requirements').select('*').limit(50);
  if (search) {
    query = query.contains('industry_types', [search]);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to load requirements' }, { status: 500 });
  }

  return NextResponse.json({ requirements: data });
}
