import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { z } from 'zod';
import { getServiceRoleClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { clerkMembershipCreatedSchema, userRoleSchema } from '@/lib/validators';
import { env, assertEnv } from '@/lib/env';

export const runtime = 'nodejs';

const clerkEventEnvelope = z.object({
  type: z.string(),
  data: z.unknown()
});

function resolveRole(role?: string) {
  if (!role) return 'admin';
  const parsed = userRoleSchema.safeParse(role);
  return parsed.success ? parsed.data : 'admin';
}

export async function POST(req: NextRequest) {
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const rawBody = await req.text();
  assertEnv(['CLERK_WEBHOOK_SECRET']);

  let event: z.infer<typeof clerkEventEnvelope>;
  try {
    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET!);
    const verified = webhook.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    });
    event = clerkEventEnvelope.parse(verified);
  } catch (error) {
    logger.error('Clerk webhook verification failed', { error });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'organizationMembership.created') {
    return NextResponse.json({ ok: true });
  }

  try {
    const membership = clerkMembershipCreatedSchema.parse(event.data);
    const supabase = getServiceRoleClient();
    const role = resolveRole(membership.organization.public_metadata.defaultRole);

    await supabase.from('users').upsert({
      id: membership.public_user_data.user_id,
      company_id: membership.organization.public_metadata.companyId,
      role
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Clerk membership webhook failed', { error });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
