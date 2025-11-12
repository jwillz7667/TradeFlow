import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceRoleClient } from '@/lib/supabase';
import { requireUser } from '@/lib/auth';
import { HttpError } from '@/lib/errors';

export const runtime = 'edge';

const companySchema = z.object({
  name: z.string().min(3),
  ein: z.string().min(9),
  industryType: z.enum(['construction', 'logistics', 'manufacturing', 'field_services']),
  employeeCount: z.number().int().positive()
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    const supabase = getServiceRoleClient();
    const body = companySchema.parse(await req.json());

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: body.name,
        ein: body.ein,
        industry_type: body.industryType,
        employee_count: body.employeeCount
      })
      .select('*')
      .single();

    if (error || !company) {
      throw new HttpError(500, 'Failed to create company');
    }

    await supabase.from('users').insert({
      id: userId,
      company_id: company.id,
      role: 'owner'
    });

    return NextResponse.json({ company });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
