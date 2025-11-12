import { DashboardShell } from '@/components/layout/DashboardShell';
import { ComplianceRiskWidget } from '@/components/dashboard/ComplianceRiskWidget';
import { RequirementsTable } from '@/components/compliance/RequirementsTable';

export default function CompliancePage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <ComplianceRiskWidget />
        <RequirementsTable />
      </div>
    </DashboardShell>
  );
}
