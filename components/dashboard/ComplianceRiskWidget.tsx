import { cn } from '@/lib/cn';
import { getComplianceStats } from '@/lib/data-samples';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export async function ComplianceRiskWidget({ className }: { className?: string }) {
  const stats = await getComplianceStats();

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Compliance Risk</CardTitle>
          <p className="text-sm text-muted-foreground">
            {Math.round(stats.auditCoverage * 100)}% of jobs covered this week
          </p>
        </div>
        <Button size="sm">Generate Audit</Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-semibold text-emerald-600">
              {Math.round(stats.auditCoverage * 100)}%
            </p>
            <p className="text-xs uppercase text-muted-foreground">Coverage</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-amber-500">{stats.outstandingViolations}</p>
            <p className="text-xs uppercase text-muted-foreground">Violations</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-rose-500">{stats.highRiskJobs}</p>
            <p className="text-xs uppercase text-muted-foreground">High Risk Jobs</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats.recentFlags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{flag.title}</p>
                <p className="text-xs text-muted-foreground">{flag.job}</p>
              </div>
              <Badge variant={flag.risk === 'high' ? 'destructive' : 'default'}>
                {flag.risk.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
