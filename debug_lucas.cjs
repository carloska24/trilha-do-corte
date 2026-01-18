const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log(
    '--- Debugging Appointments for Today (' + today.toISOString().split('T')[0] + ') ---'
  );

  // 1. Fetch ALL appointments for today
  const todaysApps = await prisma.appointments.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  console.log(`Found ${todaysApps.length} appointments for today.`);
  todaysApps.forEach(a => {
    console.log(`- [${a.time}] ${a.clientName} (Status: ${a.status}) (ID: ${a.id})`);
  });

  // 2. Fetch ALL appointments for "Lucas" (any time)
  console.log('\n--- Searching for "Lucas" (All Time) ---');
  const lucasApps = await prisma.appointments.findMany({
    where: {
      clientName: {
        contains: 'Lucas',
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 5,
  });

  if (lucasApps.length === 0) {
    console.log('No appointments found for "Lucas".');
  } else {
    lucasApps.forEach(a => {
      console.log(
        `- ${a.date.toISOString().split('T')[0]} [${a.time}] ${a.clientName} (Status: ${a.status})`
      );
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
