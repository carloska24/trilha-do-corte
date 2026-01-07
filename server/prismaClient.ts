import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL || '';
const connectionUrl = url.includes('?') ? url + '&pgbouncer=true' : url + '?pgbouncer=true';

const prisma = new PrismaClient({
  datasourceUrl: connectionUrl,
});

export default prisma;
