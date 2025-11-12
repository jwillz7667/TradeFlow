import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const supabase = getServiceRoleClient();

  try {
    if (payload.type === 'capital.financing_offer.approved') {
      const applicationId = payload.data?.object?.metadata?.applicationId;
      if (applicationId) {
        await supabase
          .from('financial_products')
          .update({ status: 'approved', metadata: payload.data.object.metadata })
          .eq('id', applicationId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook failed', { error });
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
