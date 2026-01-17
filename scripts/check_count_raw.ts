import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking Row Counts (Raw SQL)...');

  try {
    const appCount = await prisma.$queryRawUnsafe(
      'SELECT COUNT(*)::int as count FROM appointments'
    );
    console.log('Appointments Count:', appCount);
  } catch (e) {
    console.error('Error counting appointments:', e);
  }

  try {
    const clientCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM clients');
    console.log('Clients Count:', clientCount);
  } catch (e) {
    console.error('Error counting clients:', e);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
