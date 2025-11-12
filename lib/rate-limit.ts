import { Redis } from '@upstash/redis';
import { env, assertEnv } from '@/lib/env';

let redis: Redis | null = null;

function getRedis() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'production') {
      assertEnv(['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']);
    } else {
      return null;
    }
  }

  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!
    });
  }
  return redis;
}

export async function rateLimit(identifier: string, limit = 10, windowSeconds = 60) {
  const client = getRedis();
  if (!client) return;
  const key = `rate-limit:${identifier}`;
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }
  if (count > limit) {
    throw new Error('Rate limit exceeded');
  }
}
