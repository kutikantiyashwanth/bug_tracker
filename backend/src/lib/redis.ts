// @ts-nocheck
// Redis is optional — if not available, all cache operations are no-ops

let redis: any = null;
let redisAvailable = false;

export const connectRedis = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('ℹ️  No REDIS_URL set — running without cache');
    return;
  }
  try {
    const Redis = require('ioredis');
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 3000,
    });
    await redis.connect();
    redisAvailable = true;
    console.log('✅ Redis connected');
  } catch (err) {
    console.log('⚠️  Redis unavailable — running without cache');
    redis = null;
    redisAvailable = false;
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redisAvailable || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch { return null; }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
  if (!redisAvailable || !redis) return;
  try { await redis.setex(key, ttlSeconds, JSON.stringify(value)); } catch {}
};

export const cacheDel = async (...keys: string[]): Promise<void> => {
  if (!redisAvailable || !redis || keys.length === 0) return;
  try { await redis.del(...keys); } catch {}
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  if (!redisAvailable || !redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
};

export const CacheKeys = {
  project: (id: string) => `project:${id}`,
  projectList: (userId: string) => `projects:user:${userId}`,
  bug: (id: string) => `bug:${id}`,
  bugList: (projectId: string, query: string) => `bugs:${projectId}:${query}`,
  user: (id: string) => `user:${id}`,
  notifications: (userId: string) => `notifications:${userId}`,
};
