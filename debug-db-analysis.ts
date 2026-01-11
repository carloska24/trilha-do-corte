import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analyzing DB for Cleanup...');

  // 1. Find Client "Carlos"
  const carlos = await prisma.clients.findMany({
    where: { name: { contains: 'Carlos', mode: 'insensitive' } },
  });
  console.log('👤 Clients found matching "Carlos":', carlos);

  // 2. Find Barbers
  const barbers = await prisma.barbers.findMany();
  console.log('💈 Barbers found:', barbers);

  // 3. Sample Appointments to understand Barber appointments
  // (Do they have clientName='Barbeiro'? or just barberId?)
  const sampleApps = await prisma.appointments.findMany({
    take: 10,
    orderBy: { date: 'desc' },
  });
  console.log('📅 Sample Appointments:', sampleApps);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
