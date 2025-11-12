import { z } from 'zod';

export const jobIdParamSchema = z.object({
  id: z.string().uuid()
});

export const automatedAuditSchema = z.object({
  jobId: z.string().uuid(),
  force: z.boolean().optional()
});

export const financeRequestSchema = z.object({
  jobId: z.string().uuid(),
  amount: z.number().positive().max(500000),
  productType: z.enum(['material_financing', 'payroll_advance', 'invoice_factoring']),
  justification: z.string().min(20)
});

export const userRoleSchema = z.enum(['owner', 'admin', 'field_worker', 'compliance_officer']);

export const clerkMembershipCreatedSchema = z.object({
  public_user_data: z.object({
    user_id: z.string()
  }),
  organization: z.object({
    id: z.string(),
    public_metadata: z.object({
      companyId: z.string().uuid(),
      defaultRole: userRoleSchema.optional()
    })
  })
});
