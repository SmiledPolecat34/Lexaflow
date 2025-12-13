import { Redis } from '@upstash/redis';
import { env } from './env';

let redis: Redis | null = null;

export function getCacheRedis(): Redis | null {
    if (redis) return redis;

    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        });

        console.log('✅ Upstash Redis connected (cache)');
        return redis;
    }

    console.warn('⚠️ Cache Redis not configured');
    return null;
}
