import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('☢️ TRUNCATE appointments table (Nuclear Option)...');

  try {
    // TRUNCATE is faster and doesn't scan rows, so it shouldn't fail on bad bytes
    await prisma.$executeRawUnsafe('TRUNCATE TABLE appointments CASCADE');
    console.log('✅ TRUNCATE SUCCESSFUL.');
  } catch (err) {
    console.error('❌ TRUNCATE FAILED:', err);
  }

  try {
    const count = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM appointments');
    console.log('Count after truncate:', count);
  } catch (e) {
    console.error('Count failed:', e);
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
