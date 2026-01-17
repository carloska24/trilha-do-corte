import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🩺 HEALTH CHECK: Simulating Controller Query...');

  try {
    // Exact logic from getAppointments (GUEST Strategy)
    const whereClause = {
      date: { gte: new Date() },
    };

    console.log('1. Executing findMany (Guest)...');
    const appointments = await prisma.appointments.findMany({
      where: whereClause,
    });
    console.log(`✅ Success! Found ${appointments.length} appointments.`);

    // Try Filtered (simulating Client)
    console.log('2. Executing findMany (Client Filter)...');
    // Using a fake UUID
    const appointments2 = await prisma.appointments.findMany({
      where: { clientId: '00000000-0000-0000-0000-000000000000' },
    });
    console.log(`✅ Success! Found ${appointments2.length} appointments.`);
  } catch (err: any) {
    console.error('❌ CRITICAL ERROR:', err.message);
    console.error('Stack:', err.stack);
    if (err.message.includes('invalid byte sequence')) {
      console.log('👉 Diagnosis: DB text fields still contain corrupted data (0x00).');
    } else if (err.message.includes('Column')) {
      console.log('👉 Diagnosis: Schema mismatch. Run "npx prisma generate".');
    }
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
