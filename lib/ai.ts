import { getOpenAIClient } from '@/lib/openai';
import { COMPLIANCE_AUDIT_PROMPT } from '@/lib/prompts';

export async function runComplianceAudit(input: {
  jobId: string;
  jobSummary: string;
  telemetry: Record<string, unknown>;
}) {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: COMPLIANCE_AUDIT_PROMPT
      },
      {
        role: 'user',
        content: JSON.stringify(input)
      }
    ],
    response_format: { type: 'json_object' }
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('Invalid AI payload');
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}
