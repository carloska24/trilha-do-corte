import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛑 DROPPING appointments table (Nuclear Reset)...');

  try {
    // DROP TABLE removes data, structure, and INDEXES (which might be corrupted)
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS appointments CASCADE');
    console.log('✅ DROP SUCCESSFUL. Table gone.');
  } catch (err) {
    console.error('❌ DROP FAILED:', err);
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
