import { DashboardShell } from '@/components/layout/DashboardShell';
import { CapitalWidget } from '@/components/dashboard/CapitalWidget';
import { ApplicationsTable } from '@/components/finance/ApplicationsTable';

export default function FinancePage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <CapitalWidget />
        <ApplicationsTable />
      </div>
    </DashboardShell>
  );
}
