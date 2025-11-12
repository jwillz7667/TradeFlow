import { DashboardShell } from '@/components/layout/DashboardShell';
import { FinanceApplyForm } from '@/components/finance/FinanceApplyForm';

export default function FinanceApplyPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-white p-8">
        <div>
          <h1 className="text-2xl font-semibold">Request Embedded Financing</h1>
          <p className="text-sm text-muted-foreground">Underwriting completes in under 24 hours.</p>
        </div>
        <FinanceApplyForm />
      </div>
    </DashboardShell>
  );
}
