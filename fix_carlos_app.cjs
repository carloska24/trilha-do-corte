const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Searching for 'Carlos'...");

  // 1. Find the Client "Carlos A"
  const client = await prisma.clients.findFirst({
    where: {
      OR: [
        { name: { contains: 'Carlos', mode: 'insensitive' } },
        { phone: '12991823907' }, // Assuming this is his phone based on previous context, or just name
      ],
    },
  });

  if (!client) {
    console.error('❌ Client Carlos A not found!');
    return;
  }
  console.log(`✅ Client Found: ${client.name} (ID: ${client.id})`);

  // 2. Find Orphan Appointments for "Carlos" created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apps = await prisma.appointments.findMany({
    where: {
      date: { gte: today },
      clientId: null, // Only orphans
      clientName: { contains: 'Carlos', mode: 'insensitive' },
    },
  });

  console.log(`🔍 Found ${apps.length} orphan appointments for 'Carlos' today.`);

  // 3. Link them
  for (const app of apps) {
    console.log(
      `🔗 Linking App ${app.id} (${app.clientName} - ${app.time}) to Client ${client.id}...`
    );
    await prisma.appointments.update({
      where: { id: app.id },
      data: { clientId: client.id },
    });
    console.log(`✅ Linked!`);
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
