import { Suspense } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { JobStatusWidget } from '@/components/dashboard/JobStatusWidget';
import { CapitalWidget } from '@/components/dashboard/CapitalWidget';
import { ComplianceRiskWidget } from '@/components/dashboard/ComplianceRiskWidget';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="text-muted-foreground">Loading metrics...</div>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <JobStatusWidget />
          <CapitalWidget />
          <ComplianceRiskWidget className="lg:col-span-2" />
        </div>
      </Suspense>
    </DashboardShell>
  );
}
