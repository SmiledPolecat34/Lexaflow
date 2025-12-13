import { Redis } from '@upstash/redis';
import { env, isDev } from './env.js';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;
  
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Upstash Redis connected');
    return redis;
  }
  
  console.warn('⚠️ Redis not configured, caching disabled');
  return null;
}

// Cache utilities
export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  
  try {
    return await r.get<T>(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  
  try {
    if (ttlSeconds) {
      await r.set(key, value, { ex: ttlSeconds });
    } else {
      await r.set(key, value);
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function cacheDel(key: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  
  try {
    await r.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  
  try {
    const exists = await r.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
}

// Session management
export async function storeRefreshToken(
  userId: string,
  token: string,
  ttlSeconds: number
): Promise<boolean> {
  return cacheSet(`refresh_token:${userId}:${token}`, true, ttlSeconds);
}

export async function invalidateRefreshToken(
  userId: string,
  token: string
): Promise<boolean> {
  return cacheDel(`refresh_token:${userId}:${token}`);
}

export async function isRefreshTokenValid(
  userId: string,
  token: string
): Promise<boolean> {
  return cacheExists(`refresh_token:${userId}:${token}`);
}

// AI response cache
export async function cacheAIResponse(
  promptHash: string,
  response: unknown
): Promise<boolean> {
  return cacheSet(`ai_response:${promptHash}`, response, env.AI_CACHE_TTL);
}

export async function getAICachedResponse<T>(
  promptHash: string
): Promise<T | null> {
  return cacheGet<T>(`ai_response:${promptHash}`);
}

// Rate limiting for AI
export async function checkAIRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  const r = getRedis();
  if (!r) return { allowed: true, remaining: env.AI_RATE_LIMIT_PER_MINUTE, resetIn: 0 };
  
  const key = `ai_rate_limit:${userId}`;
  const windowMs = 60000; // 1 minute
  
  try {
    const current = await r.incr(key);
    
    if (current === 1) {
      await r.expire(key, 60);
    }
    
    const ttl = await r.ttl(key);
    const remaining = Math.max(0, env.AI_RATE_LIMIT_PER_MINUTE - current);
    
    return {
      allowed: current <= env.AI_RATE_LIMIT_PER_MINUTE,
      remaining,
      resetIn: ttl > 0 ? ttl : 60,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: env.AI_RATE_LIMIT_PER_MINUTE, resetIn: 0 };
  }
}
