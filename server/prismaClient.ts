import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('❌ [FATAL] DATABASE_URL is missing in environment variables.');
  process.exit(1); // Crash hard to avoid silent failures
}

const connectionUrl = url.includes('?') ? url + '&pgbouncer=true' : url + '?pgbouncer=true';

const prisma = new PrismaClient({
  datasourceUrl: connectionUrl,
});

export default prisma;
