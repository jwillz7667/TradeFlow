import { NextRequest, NextResponse } from 'next/server';
import { automatedAuditSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { requireUser, getUserCompanyId } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';
import { runComplianceAudit } from '@/lib/ai';
import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/logger';
import { HttpError } from '@/lib/errors';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUser();
    await rateLimit(`audit:${userId}`, 5, 3600);

    const body = await req.json().catch(() => {
      throw new HttpError(400, 'Invalid JSON');
    });
    const payload = automatedAuditSchema.parse({ ...body, jobId: params.id });

    const supabase = getServiceRoleClient();
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', payload.jobId)
      .single();

    if (jobError || !job) {
      throw new HttpError(404, 'Job not found');
    }

    const companyId = await getUserCompanyId(userId);
    if (job.company_id !== companyId) {
      throw new HttpError(403, 'Forbidden');
    }

    const result = await runComplianceAudit({
      jobId: payload.jobId,
      jobSummary: job.name,
      telemetry: payload.force ? { force: payload.force } : {}
    });

    const auditsPayload = (result.requirements || []).map((requirement: any) => ({
      company_id: companyId,
      requirement_id: requirement.requirementId ?? requirement.regulationId,
      job_id: job.id,
      status: requirement.status ?? 'pending',
      audit_data: requirement,
      auditor_user_id: userId
    }));

    if (!auditsPayload.length) {
      throw new HttpError(422, 'Model returned empty audit set');
    }

    const { data: inserted, error: auditError } = await supabase
      .from('compliance_audits')
      .insert(auditsPayload)
      .select('id');

    if (auditError) {
      logger.error('Failed to insert audits', { auditError });
      throw new HttpError(500, 'Failed to store audit results');
    }

    await supabase.from('events').insert({
      company_id: companyId,
      event_type: 'compliance.audit.completed',
      payload: {
        jobId: job.id,
        auditCount: inserted?.length || 0,
        highRisk: auditsPayload.filter((r) => r.audit_data?.riskScore >= 70).length
      }
    });

    await inngest.send({
      name: 'compliance/audit.completed',
      data: {
        companyId,
        jobId: job.id,
        auditIds: inserted?.map((row) => row.id)
      }
    });

    return NextResponse.json({ auditIds: inserted?.map((row) => row.id) });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('Automated audit failed', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
