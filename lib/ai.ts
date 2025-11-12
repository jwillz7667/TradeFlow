import { getOpenAIClient } from '@/lib/openai';
import { COMPLIANCE_AUDIT_PROMPT } from '@/lib/prompts';

export async function runComplianceAudit(input: {
  jobId: string;
  jobSummary: string;
  telemetry: Record<string, unknown>;
}) {
  const client = getOpenAIClient();

  const completion = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: COMPLIANCE_AUDIT_PROMPT
      },
      {
        role: 'user',
        content: JSON.stringify(input)
      }
    ]
  });

  const raw = completion.output?.[0];
  if (!raw || raw.type !== 'output_text') {
    throw new Error('Invalid AI payload');
  }

  try {
    return JSON.parse(raw.text);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}
