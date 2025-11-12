import { NextRequest, NextResponse } from 'next/server';
import { financeRequestSchema } from '@/lib/validators';
import { requireUser, getUserCompanyId } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { HttpError } from '@/lib/errors';
import { getStripeClient, getUnitClient } from '@/lib/finance';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    await rateLimit(`finance:${userId}`, 3, 3600);
    const companyId = await getUserCompanyId(userId);
    const supabase = getServiceRoleClient();

    const idempotencyKey = req.headers.get('Idempotency-Key') || crypto.randomUUID();
    const body = financeRequestSchema.parse(await req.json());

    if (process.env.STRIPE_SECRET_KEY) {
      getStripeClient();
    }
    if (process.env.UNIT_API_KEY) {
      getUnitClient();
    }

    const { data, error } = await supabase
      .from('financial_products')
      .insert({
        company_id: companyId,
        product_type: body.productType,
        amount: body.amount,
        status: 'pending',
        metadata: {
          jobId: body.jobId,
          justification: body.justification,
          idempotencyKey
        }
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new HttpError(500, 'Failed to submit financing request');
    }

    return NextResponse.json({ applicationId: data.id, idempotencyKey }, { status: 202 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
