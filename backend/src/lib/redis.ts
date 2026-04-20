import Redis from 'ioredis';
import { logger } from './logger';

let redis: Redis;

export const connectRedis = async (): Promise<void> => {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (err) => logger.error('Redis error:', err));
  await redis.connect();
};

export const getRedis = (): Redis => {
  if (!redis) throw new Error('Redis not initialized');
  return redis;
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await getRedis().get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
  await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDel = async (...keys: string[]): Promise<void> => {
  if (keys.length > 0) await getRedis().del(...keys);
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  const keys = await getRedis().keys(pattern);
  if (keys.length > 0) await getRedis().del(...keys);
};

export const CacheKeys = {
  project: (id: string) => `project:${id}`,
  projectList: (userId: string) => `projects:user:${userId}`,
  bug: (id: string) => `bug:${id}`,
  bugList: (projectId: string, query: string) => `bugs:${projectId}:${query}`,
  user: (id: string) => `user:${id}`,
  notifications: (userId: string) => `notifications:${userId}`,
};
