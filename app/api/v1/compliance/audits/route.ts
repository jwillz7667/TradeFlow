import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, getUserCompanyId } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';
import { HttpError } from '@/lib/errors';

export const runtime = 'edge';

const auditSchema = z.object({
  requirementId: z.string().uuid(),
  jobId: z.string().uuid(),
  status: z.enum(['compliant', 'non_compliant', 'pending', 'waived']),
  evidence: z.array(z.string()).optional()
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    const companyId = await getUserCompanyId(userId);
    const supabase = getServiceRoleClient();

    const input = auditSchema.parse(await req.json());

    const { error } = await supabase.from('compliance_audits').insert({
      company_id: companyId,
      requirement_id: input.requirementId,
      job_id: input.jobId,
      status: input.status,
      audit_data: { evidence: input.evidence || [] },
      auditor_user_id: userId
    });

    if (error) {
      throw new HttpError(500, 'Failed to record audit');
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
