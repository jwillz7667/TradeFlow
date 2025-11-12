import OpenAI from 'openai';
import { env, assertEnv } from '@/lib/env';

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!client) {
    assertEnv(['OPENAI_API_KEY']);
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY!, timeout: 30_000 });
  }
  return client;
}
