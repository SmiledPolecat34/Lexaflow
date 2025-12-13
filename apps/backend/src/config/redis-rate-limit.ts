import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRateLimitRedis(): Redis | null {
    if (!env.REDIS_URL) {
        console.warn('⚠️ REDIS_URL missing → rate-limit disabled');
        return null;
    }

    if (!redis) {
        redis = new Redis(env.REDIS_URL);
        console.log('✅ Redis TCP connected (rate-limit)');
    }

    return redis;
}
