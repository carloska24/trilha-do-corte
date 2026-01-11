import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking latest appointment...');

  const latest = await prisma.appointments.findFirst({
    orderBy: {
      date: 'desc', // or creation time? date is mostly correct
    },
    include: {
      client: true,
    },
  });

  if (!latest) {
    console.log('❌ No appointments found.');
    return;
  }

  console.log('✅ Latest Appointment:', latest);

  if (latest.clientId) {
    console.log('   -> Linked Client ID:', latest.clientId);
    const client = await prisma.clients.findUnique({ where: { id: latest.clientId } });
    console.log('   -> Client Data:', client);
  } else {
    console.log('   -> ❌ No Client ID linked!');
  }

  // Check closest client by name
  if (latest.clientName) {
    console.log(`\n🔍 Searching for client with name "${latest.clientName}"...`);
    const potential = await prisma.clients.findMany({
      where: { name: { contains: latest.clientName, mode: 'insensitive' } },
    });
    console.log('   -> Potential matches:', potential);
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
