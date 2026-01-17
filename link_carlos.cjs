const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '3794436f-7498-4c6d-9443-d58ae05e2fd9';

  // Find the orphan appointment
  const appt = await prisma.appointments.findFirst({
    where: {
      clientName: { contains: 'Carlos', mode: 'insensitive' },
      clientId: null,
    },
  });

  if (!appt) {
    console.log('No orphan appointment found for Carlos.');
    return;
  }

  console.log('Found Orphan Appt:', appt);

  // Update it
  const updated = await prisma.appointments.update({
    where: { id: appt.id },
    data: { clientId: userId },
  });

  console.log('✅ Successfully linked appointment to user:', updated);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
