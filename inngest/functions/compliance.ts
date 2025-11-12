import { inngest } from '@/lib/inngest';
import { runComplianceAudit } from '@/lib/ai';
import { getServiceRoleClient } from '@/lib/supabase';

export const automatedAuditWorkflow = inngest.createFunction(
  { id: 'automated-audit-workflow', name: 'Automated Compliance Audit' },
  { event: 'compliance/audit.requested' },
  async ({ event }) => {
    const supabase = getServiceRoleClient();
    const { jobId, companyId } = event.data;

    const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (!job) {
      return { success: false };
    }

    const audit = await runComplianceAudit({
      jobId,
      jobSummary: job.name,
      telemetry: event.data.telemetry || {}
    });

    await supabase.from('compliance_audits').insert(
      (audit.requirements || []).map((req: any) => ({
        company_id: companyId,
        requirement_id: req.requirementId ?? req.regulationId,
        job_id: jobId,
        status: req.status ?? 'pending',
        audit_data: req,
        auditor_user_id: event.user?.id
      }))
    );

    await supabase.from('events').insert({
      company_id: companyId,
      event_type: 'compliance.audit.completed',
      payload: { jobId }
    });

    return { success: true };
  }
);
