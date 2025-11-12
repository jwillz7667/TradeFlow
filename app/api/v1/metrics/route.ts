import { NextResponse } from 'next/server';
import { requireUser, getUserCompanyId } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  const userId = await requireUser();
  const companyId = await getUserCompanyId(userId);
  const supabase = getServiceRoleClient();

  const [jobs, audits, financing] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('compliance_audits').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase
      .from('financial_products')
      .select('amount,status')
      .eq('company_id', companyId)
  ]);

  const financed = (financing.data || []).filter((row) => ['approved', 'funded'].includes(row.status));
  const financedAmount = financed.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const avgLoanSize = financed.length ? financedAmount / financed.length : 0;

  const jobCount = jobs.count || 0;
  const auditCount = audits.count || 0;
  const auditCoverage = jobCount === 0 ? 0 : auditCount / jobCount;

  return NextResponse.json({
    mrr: jobCount * 2050,
    auditCoverage,
    avgLoanSize
  });
}
