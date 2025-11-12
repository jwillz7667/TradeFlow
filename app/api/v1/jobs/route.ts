import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, getUserCompanyId } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { HttpError } from '@/lib/errors';

export const runtime = 'edge';

const createJobSchema = z.object({
  name: z.string().min(3),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
    address: z.string()
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  estimatedValue: z.number().positive().optional()
});

export async function GET() {
  try {
    const userId = await requireUser();
    const companyId = await getUserCompanyId(userId);
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      throw new HttpError(500, 'Failed to load jobs');
    }

    return NextResponse.json({ jobs: data });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    await rateLimit(`jobs:create:${userId}`, 15, 3600);
    const companyId = await getUserCompanyId(userId);
    const supabase = getServiceRoleClient();

    const body = createJobSchema.parse(await req.json());

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        company_id: companyId,
        name: body.name,
        location: body.location,
        start_date: body.startDate,
        end_date: body.endDate,
        estimated_value: body.estimatedValue,
        status: 'draft'
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(500, 'Failed to create job');
    }

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
