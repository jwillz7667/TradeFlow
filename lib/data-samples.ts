export type JobSnapshot = {
  active: number;
  pending: number;
  delayed: number;
  pipelineValue: number;
};

export async function getJobSnapshot(): Promise<JobSnapshot> {
  return {
    active: 18,
    pending: 7,
    delayed: 3,
    pipelineValue: 825000
  };
}

export type JobListItem = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  location: string;
  startDate: string;
  riskScore: number;
};

export async function getJobList(): Promise<JobListItem[]> {
  return [
    {
      id: 'job-1',
      name: 'Hudson Rail Expansion',
      status: 'active',
      location: 'Newark, NJ',
      startDate: '2024-02-10',
      riskScore: 74
    },
    {
      id: 'job-2',
      name: 'Napa Microgrid Upgrade',
      status: 'active',
      location: 'Napa, CA',
      startDate: '2024-03-01',
      riskScore: 32
    },
    {
      id: 'job-3',
      name: 'Mission Ops Center',
      status: 'draft',
      location: 'Austin, TX',
      startDate: '2024-05-15',
      riskScore: 12
    }
  ];
}

export type CapitalSnapshot = {
  available: number;
  deployed: number;
  utilization: number;
};

export async function getCapitalSnapshot(): Promise<CapitalSnapshot> {
  return {
    available: 750000,
    deployed: 320000,
    utilization: 42
  };
}

export type ComplianceStats = {
  auditCoverage: number;
  outstandingViolations: number;
  highRiskJobs: number;
  recentFlags: { id: string; title: string; risk: 'high' | 'medium' | 'low'; job: string }[];
};

export async function getComplianceStats(): Promise<ComplianceStats> {
  return {
    auditCoverage: 0.92,
    outstandingViolations: 4,
    highRiskJobs: 2,
    recentFlags: [
      {
        id: '1926.501',
        title: 'Fall Protection - Residential Construction',
        risk: 'high',
        job: 'Hudson Yards Tower'
      },
      {
        id: '1910.305',
        title: 'Electrical Panel Clearance',
        risk: 'medium',
        job: 'Oakridge DC Retrofit'
      }
    ]
  };
}
