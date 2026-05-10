// @ts-nocheck
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set!');
    }
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      datasources: {
        db: {
          // connection_limit=5 keeps pool small for Render free tier (512MB RAM)
          // connect_timeout=10 fails fast on cold DB connections
          url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connection_limit=5&connect_timeout=10',
        },
      },
    });

    // Graceful disconnect on shutdown
    process.on('beforeExit', async () => {
      await prismaInstance?.$disconnect();
    });
  }
  return prismaInstance;
}

// Lazy proxy — only connects when first query is made
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
