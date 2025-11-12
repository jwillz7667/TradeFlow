import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJobSnapshot } from '@/lib/data-samples';

export async function JobStatusWidget() {
  const snapshot = await getJobSnapshot();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        <Stat label="Active" value={snapshot.active} tone="text-emerald-600" />
        <Stat label="Pending" value={snapshot.pending} tone="text-amber-600" />
        <Stat label="Delayed" value={snapshot.delayed} tone="text-rose-600" />
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">Revenue At Risk</p>
          <p className="text-2xl font-semibold">${snapshot.pipelineValue.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
