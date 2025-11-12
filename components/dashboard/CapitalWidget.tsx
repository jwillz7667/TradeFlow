import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCapitalSnapshot } from '@/lib/data-samples';

export async function CapitalWidget() {
  const snapshot = await getCapitalSnapshot();

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>Embedded Capital</CardTitle>
        <Button size="sm" variant="outline">
          Request Draw
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <Metric label="Available" amount={snapshot.available} />
          <Metric label="Deployed" amount={snapshot.deployed} />
        </div>
        <div>
          <p className="text-muted-foreground">Utilization</p>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${snapshot.utilization}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{snapshot.utilization}%</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, amount }: { label: string; amount: number }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">${amount.toLocaleString()}</p>
    </div>
  );
}
