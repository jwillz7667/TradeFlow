import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function RequirementsTable() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/v1/compliance/requirements`, {
    cache: 'no-store'
  });
  const { requirements = [] } = res.ok ? await res.json() : { requirements: [] };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OSHA Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requirements.map((req: any) => (
          <div key={req.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{req.title}</p>
                <p className="text-xs text-muted-foreground">{req.regulation_id}</p>
              </div>
              <span className="text-xs uppercase text-rose-500">{req.risk_level}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{req.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
