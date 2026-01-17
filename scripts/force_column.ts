import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Connecting to DB to force column addition...');
  try {
    // Raw SQL to add column safely
    const result = await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='date_new') THEN 
          ALTER TABLE "appointments" ADD COLUMN "date_new" DATE; 
        END IF; 
      END $$;
    `);
    console.log('✅ Column date_new ensured. Result:', result);
  } catch (e: any) {
    console.error('❌ Failed to execute raw SQL:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
