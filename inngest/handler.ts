import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { automatedAuditWorkflow } from '@/inngest/functions/compliance';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [automatedAuditWorkflow]
});
