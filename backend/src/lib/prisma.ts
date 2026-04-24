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
          url: process.env.DATABASE_URL,
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
