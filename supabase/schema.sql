-- TradeFlow OS canonical schema (run in Supabase SQL editor)

-- Extensions -----------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pgvector";

-- Tables ----------------------------------------------------------------------

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ein text unique not null,
  industry_type text not null check (industry_type in ('construction', 'logistics', 'manufacturing', 'field_services')),
  employee_count integer not null,
  stripe_customer_id text unique,
  unit_customer_id text unique,
  created_at timestamptz default timezone('utc', now())
);
alter table companies enable row level security;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'field_worker', 'compliance_officer')),
  created_at timestamptz default timezone('utc', now())
);
alter table users enable row level security;

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  location jsonb not null,
  start_date date not null,
  end_date date,
  estimated_value numeric(12,2),
  status text not null check (status in ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz default timezone('utc', now())
);
alter table jobs enable row level security;

create table if not exists compliance_requirements (
  id uuid primary key default uuid_generate_v4(),
  regulation_id text unique not null,
  title text not null,
  description text not null,
  industry_types text[] not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  embedding vector(1536)
);
alter table compliance_requirements enable row level security;

create table if not exists compliance_audits (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  requirement_id uuid not null references compliance_requirements(id) on delete restrict,
  job_id uuid references jobs(id) on delete set null,
  status text not null check (status in ('compliant', 'non_compliant', 'pending', 'waived')),
  audit_data jsonb not null,
  auditor_user_id uuid references users(id) on delete set null,
  created_at timestamptz default timezone('utc', now()),
  unique (company_id, requirement_id, job_id, created_at)
);
alter table compliance_audits enable row level security;

create table if not exists financial_products (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  product_type text not null check (product_type in ('material_financing', 'payroll_advance', 'invoice_factoring')),
  stripe_loan_id text unique,
  unit_account_id text unique,
  amount numeric(12,2) not null,
  status text not null check (status in ('pending', 'approved', 'funded', 'repaid', 'defaulted')),
  metadata jsonb not null,
  created_at timestamptz default timezone('utc', now())
);
alter table financial_products enable row level security;

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default timezone('utc', now())
);
alter table events enable row level security;

-- Indexes ---------------------------------------------------------------------
create index if not exists idx_jobs_company on jobs (company_id);
create index if not exists idx_audits_company on compliance_audits (company_id, job_id);
create index if not exists idx_financial_products_company on financial_products (company_id);
create index if not exists idx_events_company_created_at on events (company_id, created_at desc);
create index if not exists compliance_requirements_embedding_idx on compliance_requirements using ivfflat (embedding vector_cosine_ops);

-- Helper Functions ------------------------------------------------------------
create or replace function public.current_user_company_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select company_id from users where id = auth.uid();
$$;

grant execute on function public.current_user_company_id() to authenticated;

-- RLS Policies ----------------------------------------------------------------

create policy "Companies: only own records" on companies
  using (id = public.current_user_company_id());

create policy "Users: same company" on users
  using (company_id = public.current_user_company_id());

create policy "Jobs: multi-tenant" on jobs
  using (company_id = public.current_user_company_id())
  with check (company_id = public.current_user_company_id());

create policy "Compliance Req readable" on compliance_requirements
  for select using (true);

create policy "Compliance Audits by company" on compliance_audits
  using (company_id = public.current_user_company_id())
  with check (company_id = public.current_user_company_id());

create policy "Financial Products by company" on financial_products
  using (company_id = public.current_user_company_id())
  with check (company_id = public.current_user_company_id());

create policy "Events readable by company" on events
  using (company_id = public.current_user_company_id())
  with check (company_id = public.current_user_company_id());

-- Materialized Views ----------------------------------------------------------
create materialized view if not exists job_finance_rollup as
select
  j.company_id,
  j.id as job_id,
  sum(fp.amount) filter (where fp.status in ('approved', 'funded')) as financed_amount,
  count(fp.*) as financing_events
from jobs j
left join financial_products fp on fp.company_id = j.company_id and fp.metadata ->> 'jobId' = j.id::text
where j.status = 'active'
group by 1,2;

refresh materialized view concurrently job_finance_rollup;
