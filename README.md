# TradeFlow OS

Full-stack reference implementation for the TradeFlow OS playbook described in `plan.md`. This repository contains a production-ready Next.js 14 application, typed serverless APIs, Supabase schema, and scaffolding for AI compliance audits plus embedded finance flows.

## Stack Highlights
- **Next.js 14 App Router** on the Vercel Edge runtime
- **Clerk** for authentication (SAML-ready)
- **Supabase PostgreSQL** with RLS + pgvector (`supabase/schema.sql`)
- **OpenAI** (GPT-4o-mini) for OSHA-grade compliance analysis
- **Stripe Capital + Unit** integrations via `/app/api/v1/finance/*`
- **Inngest** background workflows for durable audit + finance automations
- **Upstash Redis** for rate limiting; **Axiom** hook in `lib/logger.ts`
- **Tailwind + Radix primitives** for the dashboard UI

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Populate the file with Supabase, Clerk, Stripe, Unit, OpenAI, and Upstash secrets.
3. **Provision Supabase**
   - Create a new Supabase project
   - Run `supabase/schema.sql` in the SQL editor (enables extensions, tables, policies, and views)
4. **Run the dev server**
   ```bash
   npm run dev
   ```
5. **Start Inngest dev server (optional)**
   ```bash
   npx inngest-cli@latest dev --env-file .env.local
   ```

## Key Paths
- `app/api/v1/*`: REST APIs for onboarding, jobs, compliance, finance, metrics, and webhooks
- `inngest/functions/*`: Background job definitions (automated compliance workflow)
- `components/dashboard/*`: Reusable widgets for the command center UX
- `lib/*`: Env parsing, Supabase clients, rate limiting, AI helpers, finance SDK wrappers
- `supabase/schema.sql`: Canonical database + RLS definition

## Workflows
- **Automated AI Audits**: `POST /api/v1/jobs/[id]/compliance/automated` → writes `compliance_audits`, emits Inngest events, and surfaces in the jobs dashboard with live Supabase channels.
- **Embedded Financing**: `POST /api/v1/finance/material-financing` enforces idempotency, persists to `financial_products`, and awaits Stripe/Unit webhook updates.
- **Monitoring**: `GET /api/v1/metrics` powers the dashboard KPIs (MRR, audit coverage, loan size) and follows the plan's append-only events guidance.

## Next Steps
- Connect the Inngest handler (`app/api/inngest/route.ts`) to your Vercel deployment.
- Wire Axiom ingestion to `lib/logger.ts` and add PostHog analytics events.
- Import OSHA requirement embeddings into `compliance_requirements` and tune `runComplianceAudit` prompt using real telemetry.

Ship fast, stay compliant. 🚀
