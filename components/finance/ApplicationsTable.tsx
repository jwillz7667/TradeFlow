import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const rows = [
  {
    id: 'mat-1',
    job: 'Hudson Rail Expansion',
    amount: 250000,
    status: 'pending'
  },
  {
    id: 'mat-2',
    job: 'Napa Microgrid Upgrade',
    amount: 120000,
    status: 'approved'
  }
];

export function ApplicationsTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Financing Applications</CardTitle>
        <Button size="sm">New Request</Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{row.job}</p>
                <p className="text-sm text-muted-foreground">#{row.id}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${row.amount.toLocaleString()}</p>
                <p className="text-xs uppercase text-muted-foreground">{row.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
