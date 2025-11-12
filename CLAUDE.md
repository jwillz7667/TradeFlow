# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TradeFlow OS** is an embedded compliance and finance operating system for field operations (construction, logistics, manufacturing). It combines:
- AI-powered OSHA compliance auditing (GPT-4o-mini)
- Embedded financing via Stripe Capital + Unit API
- Real-time dashboard with Supabase PostgreSQL + RLS
- Event-driven architecture using Inngest for durable workflows

**Stack**: Next.js 14 (App Router), TypeScript, Supabase, Clerk Auth, OpenAI, Stripe, Tailwind, Inngest, Upstash Redis.

## Common Development Commands

### Core Workflows
```bash
# Development
npm run dev                    # Start Next.js dev server (localhost:3000)
npm run build                  # Production build (checks TypeScript + ESLint)
npm run start                  # Start production server
npm run typecheck              # TypeScript validation without emit
npm run lint                   # Run ESLint on app/, lib/, components/
npm run format                 # Prettier formatting

# Inngest (background jobs)
npx inngest-cli@latest dev --env-file .env.local  # Local Inngest dev server for testing workflows
```

### Database (Supabase)
- **Schema**: `supabase/schema.sql` is the canonical database definition
- Run schema in Supabase SQL Editor (includes extensions: uuid-ossp, pgcrypto, pgvector)
- **RLS is critical**: All tables enforce row-level security via `current_user_company_id()` helper
- Service role key bypasses RLS (use only in API routes via `getServiceRoleClient()`)

## Architecture Principles

### Multi-Tenancy & Security
- **Every table has `company_id`** for tenant isolation
- **RLS enforced** on all user-facing tables (jobs, compliance_audits, financial_products, events)
- Auth flow: Clerk → `users` table → `company_id` lookup → RLS filter
- **Service role client** (`getServiceRoleClient()`) bypasses RLS for admin operations
- **Anon client** (`getAnonClient()`) respects RLS for user-scoped queries

### Client Initialization Pattern
All external services use singleton pattern with lazy init:
```typescript
// lib/supabase.ts: getAnonClient(), getServiceRoleClient()
// lib/openai.ts: getOpenAIClient()
// lib/finance.ts: getStripeClient(), getUnitClient()
// lib/inngest.ts: inngest client
```
**Never instantiate clients directly in API routes** - always use getters to enable connection pooling.

### API Route Structure
```
/app/api/v1/
  ├── jobs/[id]/compliance/automated/route.ts  # Trigger AI audit
  ├── compliance/requirements/route.ts         # List OSHA regulations
  ├── compliance/audits/route.ts               # Create manual audit
  ├── finance/webhook/stripe/route.ts          # Stripe webhook handler
  ├── metrics/route.ts                         # Dashboard KPIs
  └── webhooks/inngest/route.ts                # Inngest webhook endpoint
```

**All routes must**:
1. Call `requireUser()` from `lib/auth.ts` for authentication
2. Call `rateLimit()` from `lib/rate-limit.ts` to prevent abuse
3. Use `HttpError` from `lib/errors.ts` for consistent error responses
4. Log errors via `logger` from `lib/logger.ts`

### Runtime Constraints
- **Edge Runtime**: Finance API (`/api/v1/finance/webhook/stripe/route.ts`) runs on `nodejs` runtime due to Stripe SDK. Most other routes can use Edge.
- **Vercel limits**: Edge routes max 1MB body, 10s timeout. Node routes can extend to 30s.

### Event-Driven Compliance Workflow
1. User triggers audit: `POST /api/v1/jobs/[id]/compliance/automated`
2. Route handler calls `runComplianceAudit()` directly (synchronous for simplicity)
3. Inserts results into `compliance_audits` table
4. Emits `compliance/audit.completed` event to Inngest
5. Optional: Inngest function `automatedAuditWorkflow` can extend with async post-processing

**Current implementation** runs audit synchronously in API route. For long-running audits (>5s), refactor to:
- API route sends Inngest event immediately
- Inngest function calls `runComplianceAudit()`
- Client polls or subscribes to Supabase real-time channel for results

### AI Integration (OpenAI)
- **Model**: `gpt-4o-mini` for cost efficiency (compliance audits are structured output)
- **Prompt**: Defined in `lib/prompts.ts` as `COMPLIANCE_AUDIT_PROMPT`
- **Output**: JSON parsed from `completion.output[0].text` (not streaming currently)
- **Error handling**: Wrapped in try/catch, throws `HttpError` on parse failure

**Future fine-tuning**: Plan mentions fine-tuned model `ft:gpt-3.5-turbo-0125:your-org:osha-v1` for production OSHA expertise. Not implemented yet.

### Financial Products Flow
1. Company applies for financing via `/dashboard/finance/apply`
2. Backend creates Stripe Capital offer OR Unit banking application
3. Result stored in `financial_products` table
4. Stripe webhook updates status: `pending` → `approved` → `funded` → `repaid`
5. Idempotency: All webhook events logged to `events` table with duplicate check

**Critical**: Stripe webhooks must verify signature via `stripe.webhooks.constructEvent()`.

## Key Files & Responsibilities

### Core Libraries (`/lib`)
- **`supabase.ts`**: Singleton clients for RLS-enabled and service-role access
- **`auth.ts`**: `requireUser()` and `getUserCompanyId()` helpers
- **`openai.ts`**: OpenAI client wrapper
- **`finance.ts`**: Stripe + Unit SDK clients
- **`rate-limit.ts`**: Upstash Redis-based rate limiting
- **`prompts.ts`**: AI system prompts (compliance audit logic)
- **`errors.ts`**: Custom `HttpError` class for API responses
- **`ai.ts`**: `runComplianceAudit()` orchestration function

### Database Schema (`/supabase/schema.sql`)
- **Extensions**: uuid-ossp, pgcrypto, pgvector (for semantic search)
- **Tables**: companies, users, jobs, compliance_requirements, compliance_audits, financial_products, events
- **RLS helper**: `current_user_company_id()` function
- **Materialized view**: `job_finance_rollup` for aggregated finance metrics

### Inngest Functions (`/inngest/functions`)
- **`compliance.ts`**: `automatedAuditWorkflow` – example async audit handler (not currently used in main flow)
- **Handler**: `/inngest/handler.ts` exports Next.js route handlers (GET, POST, PUT)

### Dashboard Components (`/components`)
- **`dashboard/JobStatusWidget.tsx`**: Summary cards for active jobs
- **`dashboard/CapitalWidget.tsx`**: Financing metrics
- **`dashboard/ComplianceRiskWidget.tsx`**: Compliance status overview
- **`layout/DashboardShell.tsx`**: Main layout with nav

## Environment Variables

Required secrets (see `.env.example`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET

# OpenAI
OPENAI_API_KEY

# Stripe
STRIPE_SECRET_KEY

# Unit Finance
UNIT_API_KEY

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Optional: Observability
AXIOM_API_TOKEN
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
```

## TypeScript Configuration

- **Strict mode enabled**: All code must be fully typed
- **Path alias**: `@/*` maps to project root
- **Target**: ES2021 with bundler module resolution
- **Build failure on type errors**: `typescript.ignoreBuildErrors: false` in `next.config.mjs`

## Testing Strategy

**Current state**: No test files present. Recommended additions:
- Unit tests for `lib/` utilities (Vitest)
- Integration tests for API routes (Playwright or Vitest with MSW)
- E2E tests for compliance audit flow (Playwright)

## Known Technical Debt

1. **Supabase TypeScript types need regeneration** – `types/database.ts` contains manually generated types. For proper type safety, generate types using:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Generate types
   supabase gen types typescript --local > types/database.ts
   ```
   **Workaround**: `typescript.ignoreBuildErrors: true` is enabled in `next.config.mjs` to allow builds to pass.

2. **AI audit is synchronous** in API route – should move to Inngest for >5s operations

3. **No structured output validation** – OpenAI response parsing needs Zod schema validation for the `requirements` array structure

4. **Missing compliance_requirements seed data** – OSHA regulations table is empty (need data pipeline from OSHA API)

5. **Webhook signature verification** – Stripe webhook route exists but needs full idempotency testing

6. **Rate limiting** uses per-user keys – consider per-company limits for multi-user tenants

7. **No pgvector search implementation** – embeddings column exists but no semantic search API route

8. **Unit Finance SDK integration incomplete** – `lib/finance.ts` has TypeScript issues with Unit SDK, currently throws error. Fix by properly typing or using HTTP client instead.

## Deployment Notes

- **Platform**: Vercel (recommended) or any Next.js 14 host
- **Database**: Supabase (managed Postgres with RLS)
- **Build Configuration**:
  - App uses placeholder Clerk key (`pk_test_placeholder`) during build if env vars not set
  - This allows static generation to succeed without requiring all secrets at build time
  - Real API keys required at runtime for actual functionality
- **Inngest**: Configure webhook URL at `https://yourdomain.com/api/inngest` in Inngest dashboard
- **Clerk**: Set webhook URL for user.created events to sync `users` table
- **Stripe**: Configure webhook endpoint at `/api/v1/finance/webhook/stripe`

## Reference Documentation

- **Plan**: `plan.md` contains original product vision and full technical spec
- **README**: High-level setup instructions
- **Schema**: `supabase/schema.sql` is source of truth for data model
