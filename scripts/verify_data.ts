import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Data...');
  const count = await prisma.appointments.count();
  console.log(`Total Appointments: ${count}`);

  if (count > 0) {
    const sample = await prisma.appointments.findFirst();
    console.log('Sample:', sample);
  }
}

main().finally(() => prisma.$disconnect());
