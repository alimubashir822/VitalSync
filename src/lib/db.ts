import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Construct absolute path to dev.db to work properly on Vercel serverless functions
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const databaseUrl = `file:${dbPath}`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
