'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/SupabaseProvider';

interface ComplianceAudit {
  id: string;
  requirement_id: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'waived';
  audit_data: {
    riskScore?: number;
    remediation?: string[];
  };
  created_at: string;
}

export default function JobCompliancePage({ params }: { params: { id: string } }) {
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('compliance_audits')
        .select('*')
        .eq('job_id', params.id)
        .order('created_at', { ascending: false });
      setAudits(data || []);
    };

    load();

    const channel = supabase
      .channel('compliance-audits')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'compliance_audits', filter: `job_id=eq.${params.id}` },
        (payload) => {
          setAudits((prev) => [payload.new as ComplianceAudit, ...prev]);
          toast.success('New audit result received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, supabase]);

  const triggerAudit = async () => {
    setLoading(true);
    const response = await fetch(`/api/v1/jobs/${params.id}/compliance/automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: params.id })
    });

    if (!response.ok) {
      toast.error('Audit failed');
      setLoading(false);
      return;
    }

    toast.info('Audit enqueued');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compliance Status</CardTitle>
          <Button onClick={triggerAudit} disabled={loading}>
            {loading ? 'Auditing…' : 'Run AI Audit'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {audits.map((audit) => (
            <div key={audit.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{audit.requirement_id}</p>
                <Badge variant={audit.status === 'compliant' ? 'default' : 'destructive'}>{audit.status}</Badge>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Risk</p>
                <p className="text-xl font-semibold">
                  {audit.audit_data?.riskScore ? `${audit.audit_data.riskScore}%` : 'TBD'}
                </p>
                {audit.audit_data?.riskScore && audit.audit_data.riskScore > 70 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => router.push(`/dashboard/finance/apply?jobId=${params.id}`)}
                  >
                    Get Financing
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
