import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL || '';
const connectionUrl = url.includes('?') ? url + '&pgbouncer=true' : url + '?pgbouncer=true';

const prisma = new PrismaClient({
  datasourceUrl: connectionUrl,
});

async function main() {
  console.log('🔍 Testing Prisma Connection...');
  try {
    const clientsCount = await prisma.clients.count();
    console.log(`✅ Success! Found ${clientsCount} clients.`);

    // Now querying services should work with @map
    const services = await prisma.services.findMany({ take: 1 });
    console.log('✅ Service query success:', services);
  } catch (e: any) {
    console.error('❌ Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
