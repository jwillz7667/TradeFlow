import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getJobList } from '@/lib/data-samples';

export default async function JobsPage() {
  const jobs = await getJobList();

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-muted-foreground">Realtime risk telemetry by job.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">Create Job</Link>
        </Button>
      </div>
      <div className="mt-8 divide-y rounded-xl border bg-white">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/dashboard/jobs/${job.id}`}
            className="flex items-center justify-between p-5 hover:bg-slate-50"
          >
            <div>
              <p className="text-lg font-medium">{job.name}</p>
              <p className="text-sm text-muted-foreground">{job.location}</p>
            </div>
            <div className="flex items-center gap-6">
              <Badge variant={job.status === 'active' ? 'default' : 'outline'}>{job.status}</Badge>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Risk</p>
                <p className={`text-xl font-semibold ${job.riskScore > 60 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {job.riskScore}%
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
